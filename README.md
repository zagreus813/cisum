EchoVault
A lightweight, self-hosted personal music library built with React, Vite, Hono, Cloudflare Workers, and Cloudflare D1.
EchoVault is designed for a small private music collection that can be accessed from desktop and mobile without maintaining a traditional VPS. The application provides a responsive music player, searchable library, favorites, listening history, playlists, artist/album views, and light/dark themes.
> **Current version:** `v0.3.0`  
> **Project status:** Active development / MVP  
> **Deployment target:** Cloudflare Workers + D1  
> **Audio storage:** Local static assets for the current MVP; Cloudflare R2 is planned for the next storage stage.
---
Features
Music library
Automatic music discovery from `client/public`
Recursive scanning of supported audio files
Search by:
Track title
Artist
Album
Genre
Artist view
Album view
Recently played tracks
Liked songs
Playlist creation and management
Player
Play / Pause
Previous / Next
Seek bar
Volume control
Shuffle
Repeat
Automatic next-track playback
Persistent bottom player
Mobile-friendly mini player
Interface
Responsive desktop layout
Mobile-first navigation
Bottom navigation on small screens
Compact touch-friendly song rows
Light theme
Dark theme
Theme preference stored in the browser
Minimal UI intended to remain usable on lower-powered devices
Backend
Hono API running on Cloudflare Workers
Cloudflare D1 persistence
Favorites
Listening history
Playlists
Playlist tracks
Library bootstrap endpoint
---
Tech Stack
Layer	Technology
Frontend	React 19
Build Tool	Vite
UI Icons	Lucide React
API	Hono
Runtime	Cloudflare Workers
Database	Cloudflare D1
Deployment	Wrangler
Audio Catalog	Node.js build-time generator
Future Audio Storage	Cloudflare R2
---
Architecture
```text
                         Internet
                            |
                            v
                  +--------------------+
                  | Cloudflare Worker  |
                  |                    |
                  | React + Static UI  |
                  | Hono API           |
                  +---------+----------+
                            |
                            v
                    +---------------+
                    | Cloudflare D1 |
                    +---------------+
                       |    |    |
                       |    |    |
                 Favorites  |  History
                         Playlists


Current audio flow:

client/public/music/
        |
        v
generate-library.mjs
        |
        +--> worker/library.generated.js
        |
        +--> public/library.generated.json
        |
        v
Vite Build
        |
        v
Cloudflare Static Assets
```
The frontend and API are deployed together. Requests under `/api/*` are handled by Hono, while the compiled React application and audio assets are served as static assets.
---
Project Structure
```text
echovault-cloudflare/
|
+-- client/
|   |
|   +-- public/
|   |   +-- music/                 # Local audio files - ignored by Git
|   |   +-- covers/
|   |   +-- library.generated.json # Generated automatically
|   |
|   +-- scripts/
|   |   +-- generate-library.mjs
|   |
|   +-- src/
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- lib/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   |   +-- styles.css
|   |
|   +-- worker/
|   |   +-- index.js               # Hono API
|   |   +-- library.generated.js   # Generated automatically
|   |
|   +-- music.catalog.json         # Optional metadata overrides
|   +-- schema.sql                 # D1 schema
|   +-- vite.config.js
|   +-- wrangler.jsonc
|   +-- package.json
|
+-- server/                         # Legacy/local development code
+-- package.json
+-- .gitignore
+-- README.md
```
---
Requirements
Node.js
EchoVault currently requires:
```text
Node.js >= 22
```
Check your version:
```bash
node -v
npm -v
```
If you use `nvm`:
```bash
nvm install 22
nvm use 22
nvm alias default 22
```
---
Installation
Clone the repository:
```bash
git clone <YOUR_REPOSITORY_URL>
cd echovault-cloudflare
```
Install dependencies from the project root:
```bash
npm install
```
---
Adding Music
The recommended location is:
```text
client/public/music/
```
Example:
```text
client/public/music/
├── Artist One/
│   └── Album One/
│       ├── Track One.mp3
│       └── Track Two.mp3
└── Artist Two/
    └── Track Three.mp3
```
Supported formats currently include:
```text
.mp3
.m4a
.aac
.ogg
.opus
.wav
.flac
```
Recommended MP3 encoding
For the current project, `128 kbps MP3` provides a good balance between quality, browser compatibility, and storage usage.
Example with FFmpeg:
```bash
ffmpeg -i input.mp3 -c:a libmp3lame -b:a 128k output.mp3
```
---
Automatic Music Sync
EchoVault does not require every track to be manually added to the source code.
Before development, build, or deployment, the project scans `client/public` recursively and generates the music library.
Run it manually with:
```bash
cd client
npm run sync:music
```
Example output:
```text
✓ Synced 42 audio files from public
```
The generated files are:
```text
client/worker/library.generated.js
client/public/library.generated.json
```
These files are generated automatically and should not be edited manually.
`npm run build` and `npm run deploy` automatically run the music sync step.
---
Music Metadata
If no explicit metadata is provided, EchoVault attempts to infer information from the file and directory names.
For more accurate metadata, edit:
```text
client/music.catalog.json
```
Example:
```json
{
  "Eminem/8 Mile/Lose Yourself.mp3": {
    "title": "Lose Yourself",
    "artist": "Eminem",
    "album": "8 Mile",
    "genre": "Hip-Hop",
    "year": 2002,
    "cover": "/covers/lose-yourself.jpg"
  }
}
```
A cover can be placed under:
```text
client/public/covers/
```
If no cover is configured, EchoVault uses the default cover.
---
Cloudflare Authentication
Install dependencies first, then authenticate Wrangler:
```bash
cd client
npx wrangler login
```
Verify the active Cloudflare account:
```bash
npx wrangler whoami
```
---
Cloudflare D1 Setup
Create a D1 database:
```bash
npx wrangler d1 create echovault-db
```
Cloudflare will return a database ID.
Add that ID to:
```text
client/wrangler.jsonc
```
Example:
```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "echovault-db",
      "database_id": "YOUR-DATABASE-ID"
    }
  ]
}
```
Initialize the remote database:
```bash
npm run db:remote
```
Verify the tables:
```bash
npx wrangler d1 execute echovault-db --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table';"
```
Expected application tables include:
```text
users
favorites
history
playlists
playlist_songs
```
---
Database Model
`users`
Stores application users.
`favorites`
Stores liked tracks for a user.
`history`
Stores the most recently played tracks.
`playlists`
Stores playlist metadata.
`playlist_songs`
Stores tracks associated with playlists and their ordering.
---
API
The Worker exposes the following API routes.
Health
```http
GET /api/health
```
Bootstrap application state
```http
GET /api/bootstrap
```
Returns:
User
Songs
Favorites
History
Playlists
Songs
```http
GET /api/songs
GET /api/songs?q=<query>
GET /api/songs/:id
```
Artists
```http
GET /api/artists
```
Albums
```http
GET /api/albums
```
Favorites
```http
GET    /api/favorites
PUT    /api/favorites/:songId
DELETE /api/favorites/:songId
```
Listening history
```http
GET  /api/history
POST /api/history
```
Example request body:
```json
{
  "songId": "trk_example"
}
```
Playlists
```http
GET    /api/playlists
POST   /api/playlists
DELETE /api/playlists/:playlistId
```
Playlist tracks
```http
POST   /api/playlists/:playlistId/songs
DELETE /api/playlists/:playlistId/songs/:songId
```
---
Development
From the repository root:
```bash
npm install
```
Then:
```bash
cd client
npm run dev
```
The development script automatically runs:
```bash
npm run sync:music
```
before starting Vite.
---
Build
```bash
cd client
npm run build
```
The build process automatically:
Scans local music files
Regenerates the library
Builds the React application
Prepares the Worker/static assets for deployment
---
Deployment
Make sure:
Wrangler is authenticated
`wrangler.jsonc` contains the correct D1 database ID
The remote D1 schema has been initialized
Your music files exist locally
Then run:
```bash
cd client
npm run deploy
```
Or:
```bash
npm run build
npx wrangler deploy
```
Wrangler will return a public URL similar to:
```text
https://echovault.<your-subdomain>.workers.dev
```
Test the API:
```text
https://echovault.<your-subdomain>.workers.dev/api/health
```
---
Important: Music Files and Git
Audio files should not be committed to Git.
Reasons include:
Repository size
Slow clone/pull operations
GitHub repository limits
Music licensing/copyright considerations
Future migration to Cloudflare R2
The repository ignores the local music directory.
Recommended `.gitignore` rules:
```gitignore
# Dependencies / builds
node_modules/
dist/
.wrangler/
.dev.vars*
.DS_Store

# Personal music library
client/public/music/*
!client/public/music/.gitkeep

# Generated music catalogs
client/public/library.generated.json
client/worker/library.generated.js
```
Create the placeholder file so the empty directory remains visible in Git:
```bash
touch client/public/music/.gitkeep
```
If music was already added to Git
Adding a path to `.gitignore` does not automatically remove files that Git is already tracking.
Run:
```bash
git rm -r --cached client/public/music
```
Then recreate the placeholder if needed:
```bash
mkdir -p client/public/music
touch client/public/music/.gitkeep
```
Finally:
```bash
git add .gitignore client/public/music/.gitkeep
git commit -m "Ignore local music library"
```
The physical music files remain on your computer; `--cached` only removes them from Git tracking.
---
Important Deployment Note
Ignoring `client/public/music` does not prevent manual deployment from your computer.
When you run:
```bash
npm run deploy
```
the local build still sees your local music files and can include them in the deployment.
However, if you later use:
GitHub Actions
Cloudflare Git integration
Another CI/CD service
the build server will only receive files stored in Git, so the ignored music files will not exist there.
The planned solution is to migrate audio storage to Cloudflare R2, while keeping only metadata and application code in Git.
---
Linux / GLIBC Troubleshooting
Recent Cloudflare `workerd` builds require newer GLIBC versions.
For example, Ubuntu 20.04 commonly ships with:
```text
GLIBC 2.31
```
and local Wrangler/D1 emulation may fail with errors such as:
```text
GLIBC_2.32 not found
GLIBC_2.34 not found
GLIBC_2.35 not found
write EPIPE
```
This affects the local `workerd` runtime, not the remote Cloudflare D1 database itself.
You can check your GLIBC version with:
```bash
ldd --version
```
Do not manually replace the system GLIBC library.
Safer long-term options are:
A newer Linux distribution
A container with a newer userspace
Remote Cloudflare development/deployment
Remote database commands can still be used with:
```bash
npm run db:remote
```
---
Current Authentication Model
EchoVault currently uses one built-in demo user:
```text
usr_demo
```
This means all visitors currently share:
Favorites
Listening history
Playlists
This is acceptable for the current small-group MVP, but it is not a complete multi-user authentication system.
A future version should add:
User registration/login
Session management
Per-user favorites
Per-user playlists
Per-user listening history
Access control for private libraries
---
Roadmap
Planned improvements include:
[ ] Cloudflare R2 audio storage
[ ] Real authentication
[ ] Separate user profiles
[ ] Private/shared playlists
[ ] Better audio metadata extraction
[ ] ID3 tag support
[ ] Automatic album artwork handling
[ ] Queue management
[ ] Improved mobile player interactions
[ ] Progressive Web App support
[ ] Offline metadata caching
[ ] R2 upload/admin workflow
---
Privacy and Copyright
EchoVault is intended as a personal/private music library.
Before making a library publicly accessible, ensure that you have the appropriate rights or permissions to distribute the audio files being served.
The source repository should contain application code only, not copyrighted personal music files.
---
Development Workflow
Typical workflow:
```bash
# Add or update music locally
cp my-song.mp3 client/public/music/

# Regenerate library
cd client
npm run sync:music

# Test/build
npm run build

# Deploy
npm run deploy
```
Application code can then be committed separately:
```bash
git add .
git status
git commit -m "Improve EchoVault UI and music library"
git push
```
Always check `git status` before committing to verify that audio files are not staged.
---
Version
```text
EchoVault v0.3.0
```
Built as a lightweight personal music platform using Cloudflare's serverless stack.
