# EchoVault — Cloudflare deployment

This edition runs React + Hono in one Cloudflare Worker and stores app state in D1.
The bundled demo MP3 files remain static assets for the first public demo.

## 1. Install

```bash
npm install
cd client
```

## 2. Authenticate

```bash
npx wrangler login
```

## 3. Create D1

```bash
npx wrangler d1 create echovault-db
```

Copy the returned `database_id` into `client/wrangler.jsonc`.

## 4. Initialize local D1 and test locally

```bash
npm run db:local
npm run dev
```

Open the Vite URL shown in the terminal.

## 5. Initialize production D1

```bash
npm run db:remote
```

## 6. Deploy

```bash
npm run deploy
```

Wrangler prints a public `https://<name>.<subdomain>.workers.dev` URL.

## Notes

- This version intentionally uses one shared demo account (`usr_demo`). Everyone sees the same favorites, history and playlists.
- Add real authentication before giving different users private libraries.
- For the real music library, move MP3 files to Cloudflare R2 instead of bundling them as Worker static assets.
