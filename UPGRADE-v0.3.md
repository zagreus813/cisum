# EchoVault v0.3 – Music sync + mobile UI

## What changed

- `client/public` is now scanned recursively for supported audio files before every build/deploy.
- New audio files are added to the Worker library without editing `worker/seed.js`.
- Optional metadata overrides live in `client/music.catalog.json`.
- A default cover is used when no cover is configured.
- Responsive mobile layout now uses compact song rows, a bottom navigation bar, and a mini player above it.
- The large hero and decorative UI were removed.
- Light and dark themes are supported and the selected theme is saved in the browser.

## Add a song

Copy the file anywhere under `client/public` (recommended: `client/public/music/`).

Then run:

```bash
cd client
npm run sync:music
```

The generated catalog can be inspected at:

```text
client/public/library.generated.json
```

For better metadata, add an entry to `client/music.catalog.json` using either the path relative to `public` or, for files inside `public/music`, the path relative to `public/music`, for example:

```json
{
  "Artist/Album/my-song.mp3": {
    "title": "My Song",
    "artist": "Artist",
    "album": "Album",
    "genre": "Pop",
    "cover": "/covers/my-song.jpg"
  }
}
```

## Deploy

Keep your existing `client/wrangler.jsonc` because it already contains your real D1 `database_id`.

Then:

```bash
cd client
npm run build
npx wrangler deploy
```

`npm run build` automatically runs `sync:music` first.
