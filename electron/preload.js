const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer (Admin Panel React app)
contextBridge.exposeInMainWorld('electronAPI', {
  // Check if FFmpeg is available
  checkFFmpeg: () => ipcRenderer.invoke('ffmpeg:check'),

  // List audio devices  
  listAudioDevices: () => ipcRenderer.invoke('ffmpeg:list-audio'),

  // Start YouTube live stream
  // streamKey: YouTube stream key
  // quality: '480p' | '720p' | '1080p'
  // audioDevice: audio device name (optional)
  startStream: (streamKey, quality, audioDevice) =>
    ipcRenderer.invoke('ffmpeg:start', { streamKey, quality, audioDevice }),

  // Stop the stream
  stopStream: () => ipcRenderer.invoke('ffmpeg:stop'),

  // Get current stream status
  getStreamStatus: () => ipcRenderer.invoke('ffmpeg:get-status'),

  // Listen for status changes from main process
  onStreamStatus: (callback) => {
    ipcRenderer.on('ffmpeg:status', (event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('ffmpeg:status');
  },

  // Listen for FFmpeg log lines
  onStreamLog: (callback) => {
    ipcRenderer.on('ffmpeg:log', (event, line) => callback(line));
    return () => ipcRenderer.removeAllListeners('ffmpeg:log');
  },

  // Check if running inside Electron
  isElectron: true,

  // Open URL in system default browser
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
});
