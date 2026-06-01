const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// FFmpeg binary path (bundled with app)
function getFFmpegPath() {
  if (app.isPackaged) {
    // In packaged .exe, ffmpeg is in resources folder
    return path.join(process.resourcesPath, 'ffmpeg.exe');
  }
  // In development, use ffmpeg-static
  try {
    return require('ffmpeg-static');
  } catch (e) {
    return 'ffmpeg'; // Fallback to system ffmpeg
  }
}

let mainWindow = null;
let ffmpegProcess = null;
let streamStatus = 'idle'; // idle | starting | streaming | stopping | error

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/logo.png'),
    title: 'NEXTSTEP Academy - Admin Panel',
    titleBarStyle: 'default',
  });

  if (app.isPackaged) {
    // In packaged .exe, load the built dist/index.html
    // __dirname points to resources/app/electron/ so go up to find dist
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // In development, load Vite dev server
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    // Stop FFmpeg if running when window closes
    stopFFmpeg();
    mainWindow = null;
  });
}

// ── FFmpeg Control ──────────────────────────────────────────────

function stopFFmpeg() {
  if (ffmpegProcess) {
    try {
      ffmpegProcess.kill('SIGTERM');
      setTimeout(() => {
        if (ffmpegProcess) ffmpegProcess.kill('SIGKILL');
      }, 2000);
    } catch (e) {}
    ffmpegProcess = null;
  }
  streamStatus = 'idle';
}

function getAudioDevice() {
  // Windows default audio device
  return 'audio=virtual-audio-capturer';
}

function buildFFmpegArgs(streamKey, quality, audioDevice) {
  const qualities = {
    '480p':  { res: '854x480',   bitrate: '1500k', preset: 'ultrafast' },
    '720p':  { res: '1280x720',  bitrate: '3000k', preset: 'veryfast'  },
    '1080p': { res: '1920x1080', bitrate: '6000k', preset: 'fast'      },
  };
  const q = qualities[quality] || qualities['720p'];
  const rtmpUrl = `rtmp://a.rtmp.youtube.com/live2/${streamKey}`;

  return [
    // Input: Screen capture (Windows Desktop Duplication API)
    '-f', 'gdigrab',
    '-framerate', '30',
    '-draw_mouse', '1',
    '-i', 'desktop',
    // Input: Microphone / System Audio
    '-f', 'dshow',
    '-i', audioDevice,
    // Video encoding
    '-vf', `scale=${q.res}`,
    '-vcodec', 'libx264',
    '-preset', q.preset,
    '-b:v', q.bitrate,
    '-maxrate', q.bitrate,
    '-bufsize', `${parseInt(q.bitrate) * 2}k`,
    '-pix_fmt', 'yuv420p',
    '-g', '60',
    // Audio encoding
    '-acodec', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    // Output: YouTube RTMP
    '-f', 'flv',
    rtmpUrl,
  ];
}

// ── IPC Handlers ────────────────────────────────────────────────

ipcMain.handle('app:open-external', async (event, url) => {
  await shell.openExternal(url);
  return true;
});

// Check if FFmpeg is available
ipcMain.handle('ffmpeg:check', async () => {
  const ffmpegPath = getFFmpegPath();
  return new Promise((resolve) => {
    const check = spawn(ffmpegPath, ['-version']);
    check.on('error', () => resolve({ available: false, path: ffmpegPath }));
    check.on('close', (code) => resolve({ available: true, path: ffmpegPath }));
  });
});

// List audio devices
ipcMain.handle('ffmpeg:list-audio', async () => {
  const ffmpegPath = getFFmpegPath();
  return new Promise((resolve) => {
    const proc = spawn(ffmpegPath, ['-list_devices', 'true', '-f', 'dshow', '-i', 'dummy']);
    let output = '';
    proc.stderr.on('data', (d) => { output += d.toString(); });
    proc.on('close', () => {
      const devices = [];
      const regex = /\[dshow @ [^\]]+\]\s+"([^"]+)"\s+\(audio\)/g;
      let match;
      while ((match = regex.exec(output)) !== null) {
        devices.push(match[1]);
      }
      resolve(devices);
    });
  });
});

// Start streaming
ipcMain.handle('ffmpeg:start', async (event, { streamKey, quality, audioDevice }) => {
  if (ffmpegProcess) {
    return { success: false, error: 'Stream is already running.' };
  }

  const ffmpegPath = getFFmpegPath();
  let audio = audioDevice || 'audio=Microphone Array (Realtek High Definition Audio)';
  if (!audio.startsWith('audio=')) {
    audio = `audio=${audio}`;
  }
  const args = buildFFmpegArgs(streamKey, quality || '720p', audio);

  return new Promise((resolve) => {
    streamStatus = 'starting';
    mainWindow?.webContents.send('ffmpeg:status', { status: 'starting' });

    ffmpegProcess = spawn(ffmpegPath, args);
    let startupError = '';
    let started = false;

    const startTimeout = setTimeout(() => {
      if (!started) {
        started = true;
        streamStatus = 'streaming';
        mainWindow?.webContents.send('ffmpeg:status', { status: 'streaming' });
        resolve({ success: true });
      }
    }, 5000);

    ffmpegProcess.stderr.on('data', (data) => {
      const line = data.toString();
      console.log('[ffmpeg]', line.trim());

      // Detect successful stream start
      if (!started && (line.includes('frame=') || line.includes('fps='))) {
        started = true;
        clearTimeout(startTimeout);
        streamStatus = 'streaming';
        mainWindow?.webContents.send('ffmpeg:status', { status: 'streaming' });
        resolve({ success: true });
      }

      // Detect errors
      if (line.includes('Connection refused') || line.includes('No such file') || line.includes('Invalid data')) {
        startupError += line;
      }

      // Send log lines to renderer
      mainWindow?.webContents.send('ffmpeg:log', line.trim());
    });

    ffmpegProcess.on('error', (err) => {
      clearTimeout(startTimeout);
      streamStatus = 'error';
      ffmpegProcess = null;
      mainWindow?.webContents.send('ffmpeg:status', { status: 'error', message: err.message });
      if (!started) {
        started = true;
        resolve({ success: false, error: err.message });
      }
    });

    ffmpegProcess.on('close', (code) => {
      clearTimeout(startTimeout);
      ffmpegProcess = null;
      if (code !== 0 && !started) {
        started = true;
        resolve({ success: false, error: startupError || `FFmpeg exited with code ${code}` });
      }
      streamStatus = 'idle';
      mainWindow?.webContents.send('ffmpeg:status', { status: 'idle' });
    });
  });
});

// Stop streaming
ipcMain.handle('ffmpeg:stop', async () => {
  stopFFmpeg();
  return { success: true };
});

// Get current status
ipcMain.handle('ffmpeg:get-status', async () => {
  return { status: streamStatus };
});

// ── App Events ──────────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopFFmpeg();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
