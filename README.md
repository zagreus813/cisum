# EchoVault Demo

Local-first personal music library demo.

## Stack
- React 19 + Vite 8
- Hono API on Node.js
- JSON persistence for demo state
- Local MP3s at 128 kbps

## Run
```bash
npm install
npm run dev
```

Open http://localhost:5173
API: http://localhost:8787/api/health

## Replace demo tracks
Put your own MP3s under `client/public/music/`, covers under `client/public/covers/`, then edit `server/src/seed.js`.

Recommended conversion:
```bash
ffmpeg -i input.mp3 -c:a libmp3lame -b:a 128k output.mp3
```

## Next production step
Frontend -> Cloudflare Pages
API -> Cloudflare Worker
Audio -> Cloudflare R2
Metadata/state -> Cloudflare D1 or another small database
# cisum
