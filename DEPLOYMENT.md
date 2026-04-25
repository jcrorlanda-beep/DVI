# DVI Workshop Management App — Deployment Guide

## Overview

DVI is a React + TypeScript + Vite single-page application.  
All data is stored in **browser localStorage** — no backend server or database is required.  
The app runs entirely in the browser after the static build files are served.

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | Build only |
| npm | 9+ | Build only |
| Any static file server | — | nginx, serve, Vite preview |
| Modern browser | Chrome/Edge/Firefox | Required for localStorage |

---

## Build for Production

```bash
# Install dependencies
npm install

# Build
npm run build
# Output: dist/

# Preview locally
npm run preview
```

The `dist/` folder contains all static files. Serve it with any web server.

---

## Serving on the Same Wi-Fi Network

Any device on the same Wi-Fi network can access the app.

### Option A — Vite preview (dev/testing)

```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

Access from other devices: `http://<your-machine-IP>:4173`

### Option B — serve (lightweight static server)

```bash
npx serve dist --listen 0.0.0.0:4173
```

### Option C — nginx (production)

```nginx
server {
  listen 80;
  root /path/to/dist;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**Find your machine IP:**
- Windows: `ipconfig` → IPv4 Address
- macOS/Linux: `ifconfig` or `ip addr`

---

## Environment Variables

Environment variables are injected **at build time** by Vite using the `VITE_` prefix.

### Available Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Optional | OpenAI API key for AI-assisted draft generation |
| `VITE_OLLAMA_BASE_URL` | Optional | Ollama base URL (default: `http://localhost:11434`) |

### Setup

Create a `.env` file in the project root (already gitignored):

```env
# .env  — never commit this file
VITE_OPENAI_API_KEY=sk-...
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

> ⚠ **API Key Safety:** The OpenAI key is embedded in the built JS bundle if set at build time.  
> Do not deploy a build with a production API key to a public URL without additional access control.

### Reading env vars in code

```ts
const apiKey = import.meta.env.VITE_OPENAI_API_KEY ?? "";
```

---

## Local AI with Ollama

The app supports a hybrid AI mode: Ollama (local, private) with OpenAI fallback.

### Setup Ollama

1. Install from https://ollama.com
2. Pull a model:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull mistral
   ```
3. Start the server:
   ```bash
   ollama serve
   # Runs on http://localhost:11434 by default
   ```
4. In the app → Settings → AI Configuration → select **Ollama (Local)**

### Same-Network Ollama Access

To allow other devices on the same Wi-Fi to use Ollama:

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Set `VITE_OLLAMA_BASE_URL=http://<host-machine-IP>:11434` in `.env`.

---

## OpenAI Fallback

When Ollama is unavailable or returns an error, the app falls back to the OpenAI API.

- Set `VITE_OPENAI_API_KEY` in `.env`
- In the app → Settings → AI Configuration → select **OpenAI** or **Auto (Ollama → OpenAI fallback)**
- Fallback advisor text is used when both providers are unavailable

---

## Android SMS Gateway (Optional)

For SMS approval link dispatch, configure the SMS provider in  
**Settings → SMS Provider**.

| Provider | Notes |
|----------|-------|
| Simulated | Default — no real SMS sent |
| Android SMS Gateway | Self-hosted app on an Android phone |
| Twilio | Cloud SMS service |

Configuration is stored in localStorage (not in code or env).

---

## Backup Recommendation

Since all data lives in **browser localStorage**:

- Export a backup regularly via **Backup & Export → Download Backup**
- Store the `.json` file externally (USB drive, cloud storage, email)
- Restore by pasting the JSON in the **Restore** section
- **Do not clear browser data** without first exporting a backup
- Different browsers on different devices have **separate localStorage** — data is not synced automatically

---

## API Key Security Checklist

- [x] `.env` and `.env.*` are in `.gitignore`
- [x] No API keys hardcoded in source files
- [x] `VITE_OPENAI_API_KEY` is read from environment only — never stored in localStorage
- [x] Android SMS Gateway API key is stored in localStorage (user-entered in Settings), not in code
- [x] Twilio credentials are stored in localStorage (user-entered in Settings), not in code
- [ ] If deploying to a shared/public server: add HTTP Basic Auth or VPN to protect the app and embedded keys

---

## Data Reset

To reset all app data:

1. In the app → Settings → scroll to "Danger Zone" → **Reset All Data**  
   OR
2. Clear the site's localStorage in browser DevTools:  
   `Application → Storage → Local Storage → Clear All`

---

## Ports Summary

| Service | Default Port |
|---------|-------------|
| Vite dev server | 5173 |
| Vite preview | 4173 |
| Ollama API | 11434 |
| nginx (production) | 80 / 443 |

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| White screen on load | JavaScript error or corrupted localStorage | Open DevTools Console; or clear localStorage |
| AI features not working | Missing API key or Ollama not running | Check Settings → AI Configuration |
| "Port in use" | Another process on the same port | Use `--port <other>` flag |
| Data lost after browser update | Browser cleared storage | Restore from backup JSON |
| Other devices can't connect | Firewall or wrong IP | Allow the port in firewall; verify IP with `ipconfig` |
