# NEXTSTEP Academy: Jitsi Meet & YouTube Live Integration Setup Guide

This guide details how to configure the production self-hosted **Jitsi Meet** video conferencing environment, set up the **Jibri** RTMP stream capture daemon to broadcast to YouTube Live, and configure the **Google Developer Console Project** for automated streaming.

---

## 🏗️ 1. Self-Hosted Jitsi Meet with Token Authentication

To secure the interactive video rooms (so only authenticated teachers/students from NEXTSTEP Academy can join), Jitsi Meet must be configured to use JWT authentication powered by the Prosody module.

### Prerequisites
- A dedicated Linux server (e.g., Ubuntu 22.04 LTS) with a public IP.
- Minimum resources: 4 vCPUs, 8GB RAM, and a SSD.
- A fully-qualified domain name (FQDN) like `meet.nextstepacademy.com` pointing to the server's public IP.
- Port access: `80/tcp` (HTTP), `443/tcp` (HTTPS), `4443/tcp` (Jitsi videobridge fallback), `10000/udp` (JVB media stream).

### Step 1: Clone Jitsi Meet Docker
Log into your server and run:
```bash
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet
cp env.example .env
```

### Step 2: Configure `.env` for Token Security
Modify the following values in the `.env` file to enable JWT auth and align with NEXTSTEP settings:

```env
# General configuration
HTTP_PORT=80
HTTPS_PORT=443
PUBLIC_URL=https://meet.nextstepacademy.com

# Enable Let's Encrypt SSL
ENABLE_LETSENCRYPT=1
LETSENCRYPT_EMAIL=your-email@nextstepacademy.com
LETSENCRYPT_DOMAIN=meet.nextstepacademy.com

# Enable JWT Token Authentication
ENABLE_AUTH=1
AUTH_TYPE=jwt

# JWT Authentication Config
# (These must match the Jitsi settings saved in NEXTSTEP Admin Panel > Settings)
JWT_APP_ID=nextstep_academy_app
JWT_APP_SECRET=ChooseAStrongRandomJitsiJwtSecretKeyHere
JWT_ACCEPTED_ISSUERS=nextstep_academy_app
JWT_ACCEPTED_AUDIENCES=jitsi

# Enable Guest Access (Optional: allows users without tokens to join if authorized)
# In our app, students & teachers get custom signed JWTs, so keep ENABLE_GUEST_BYPASS=0 for maximum security.
ENABLE_GUEST_BYPASS=0
```

### Step 3: Run the Jitsi Cluster
Generate required passwords and start the services:
```bash
./gen-passwords.sh
docker compose up -d
```
Your Jitsi server will now be running. Test it by navigating to `https://meet.nextstepacademy.com` in your browser. (It should prompt for credentials or token since `ENABLE_AUTH=1` is active).

---

## 📹 2. Jibri Setup for YouTube Live Streaming (RTMP)

Jibri (Jitsi Broadcasting Infrastructure) acts as a virtual participant that joins the meeting using a headless Chrome window, captures the composite audio/video, and transcodes it to an RTMP stream which is pushed to YouTube.

### Prerequisites
- A separate server (recommended) or the same server with loopback audio device configuration.
- ALSA loopback kernel module enabled: `sudo modprobe snd-aloop`.

### Step 1: Add Jibri to Docker Compose
In your `docker-compose.yml` (from the Jitsi Docker repository), ensure the `jibri` service is defined:

```yaml
  jibri:
    image: jitsi/jibri:latest
    restart: unless-stopped
    volumes:
      - /dev/shm:/dev/shm
    environment:
      - XANOMALOUS_CONTROL_ENABLE=true
      - JIBRI_RECORDER_USER=recorder
      - JIBRI_RECORDER_PASSWORD=jibri_recorder_secret
      - JIBRI_XPRA_HTML_ENVELOPE=false
      - PUBLIC_URL=https://meet.nextstepacademy.com
    depends_on:
      - xmpp
```

### Step 2: Enable Streaming in Prosody & Jicofo
In your Jitsi configuration, ensure Jicofo is configured to allow room streaming by setting `ENABLE_RECORDING=1` and `JIBRI_PENDING_TIMEOUT=90`. Jicofo will automatically orchestrate Jibri when the teacher clicks the "Start Broadcast" button in the control room.

---

## 🔑 3. Google API & YouTube OAuth Setup

The automated broadcast system creates YouTube Live Broadcasts and Live Streams on the teacher's channel using the **YouTube Data API v3**.

### Step 1: Create a Google Developer Project
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project called **NEXTSTEP Academy**.
3. Search for **YouTube Data API v3** in the Library and click **Enable**.

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** and fill in the required fields (App name, support email, developer info).
3. Under **Scopes**, add:
   - `https://www.googleapis.com/auth/youtube`
   - `https://www.googleapis.com/auth/youtube.force-ssl`
   - `https://www.googleapis.com/auth/youtube.readonly`
4. Under **Test Users**, add the Google Gmail address of the streaming account: `97487787lecnextstepyt@gmail.com`.

### Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials** and click **Create Credentials > OAuth client ID**.
2. Choose **Web application**.
3. Under **Authorized Redirect URIs**, enter:
   - `https://asia-south1-next-step-academy-5b9ab.cloudfunctions.net/youtubeCallback`
4. Click **Create** and copy the resulting `Client ID` and `Client Secret`.

### Step 4: Link YouTube Account via NEXTSTEP Admin Panel
1. Log into your **NEXTSTEP Academy Admin Panel**.
2. Navigate to **Settings** > **Live & Jitsi Settings**.
3. Paste the **Client ID** and **Client Secret** into the form fields.
4. Paste the Jitsi settings (Domain: `meet.nextstepacademy.com`, App ID: `nextstep_academy_app`, App Secret: `ChooseAStrongRandomJitsiJwtSecretKeyHere`).
5. Click **Save Settings**.
6. Under **YouTube Channel Connection**, click **Connect YouTube Channel**.
7. Log in with the `97487787lecnextstepyt@gmail.com` Google account and grant the requested streaming permissions.
8. Once redirected back, the system will show "Connected" with the channel status active.

---

## 🧪 4. Live Classroom Verification Checklist

Run this checklist to verify the full end-to-end integration:

1. **Scheduling a Class**:
   - In the Admin Panel, go to **Live Classes** > **Schedule Class**.
   - Fill in the title, course, subject, and select meeting type: **Interactive Jitsi Classroom**.
   - Save the class. Verify it appears on the upcoming list.

2. **Starting the Live Session**:
   - As an admin/teacher, locate the class and click **Start Class**.
   - The Moderator Control Room Dashboard will open showing the embedded Jitsi Iframe.
   - Verify that your camera/microphone connect successfully and you have the "Moderator" badge.

3. **Starting the YouTube Broadcast**:
   - In the Control Room dashboard, click **Start Broadcast to YouTube**.
   - Behind the scenes, the Firebase function will create a YouTube Live Broadcast, and call the Jitsi API to start the Jibri RTMP stream.
   - Open YouTube on a separate screen to verify your live feed is displaying.

4. **Student Joining (Student App)**:
   - Open the student app and navigate to **Live Classes**.
   - The scheduled class should appear with the status "LIVE NOW".
   - Click **Join Class**. The student app will request the Jitsi token from the backend, record their attendance in the Firestore `live_attendance` collection, and open the Jitsi meeting.
   - Verify that the student is restricted from muting/kicking others (Participant role).
   - Go back to the Admin control room and verify that the student is listed in the real-time **Attendance Tracker** sidebar.

5. **Ending the Meeting & VOD Conversion**:
   - Click **End Class** in the Admin Control Room.
   - Confirm that the Jitsi iframe closes and the YouTube live stream transitions to "complete".
   - Wait 1-2 minutes and verify that a new recorded lecture has been created automatically in the **Lectures** collection, linking to the YouTube recording.
   - Open the student app > Course Details > **Lectures** to confirm the recording is watchable.
