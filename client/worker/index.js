import { Hono } from 'hono'
import { songs } from './library.generated.js'

const app = new Hono()
const USER_ID = 'usr_demo'

const findSong = (id) => songs.find((song) => song.id === id)
const requireSong = (c, id) => {
  const song = findSong(id)
  if (!song) return c.json({ error: 'Song not found' }, 404)
  return song
}

async function getUser(db) {
  return db.prepare('SELECT id, name FROM users WHERE id = ?').bind(USER_ID).first()
}

async function getFavorites(db) {
  const result = await db.prepare(
    'SELECT song_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(USER_ID).all()
  return result.results.map((row) => row.song_id)
}

async function getHistory(db) {
  const result = await db.prepare(
    'SELECT song_id FROM history WHERE user_id = ? ORDER BY played_at DESC LIMIT 50'
  ).bind(USER_ID).all()
  return result.results.map((row) => row.song_id)
}

async function getPlaylists(db) {
  const result = await db.prepare(`
    SELECT p.id, p.name, p.created_at, ps.song_id, ps.position
    FROM playlists p
    LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
    WHERE p.user_id = ?
    ORDER BY p.created_at ASC, ps.position ASC
  `).bind(USER_ID).all()

  const byId = new Map()
  for (const row of result.results) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        name: row.name,
        songIds: [],
        createdAt: row.created_at,
      })
    }
    if (row.song_id) byId.get(row.id).songIds.push(row.song_id)
  }
  return [...byId.values()]
}

async function getPlaylist(db, playlistId) {
  const playlist = await db.prepare(
    'SELECT id, name, created_at FROM playlists WHERE id = ? AND user_id = ?'
  ).bind(playlistId, USER_ID).first()
  if (!playlist) return null

  const tracks = await db.prepare(
    'SELECT song_id FROM playlist_songs WHERE playlist_id = ? ORDER BY position ASC'
  ).bind(playlistId).all()

  return {
    id: playlist.id,
    name: playlist.name,
    createdAt: playlist.created_at,
    songIds: tracks.results.map((row) => row.song_id),
  }
}

app.get('/api/health', (c) => c.json({ ok: true, service: 'echovault-cloudflare-api' }))

app.get('/api/bootstrap', async (c) => {
  const [user, favorites, history, playlists] = await Promise.all([
    getUser(c.env.DB),
    getFavorites(c.env.DB),
    getHistory(c.env.DB),
    getPlaylists(c.env.DB),
  ])

  return c.json({
    user,
    songs: [...songs].sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    favorites,
    history,
    playlists,
  })
})

app.get('/api/songs', (c) => {
  const q = (c.req.query('q') || '').toLowerCase().trim()
  const result = !q
    ? songs
    : songs.filter((song) => [song.title, song.artist, song.album, song.genre]
        .some((value) => value.toLowerCase().includes(q)))
  return c.json(result)
})

app.get('/api/songs/:id', (c) => {
  const song = requireSong(c, c.req.param('id'))
  return song instanceof Response ? song : c.json(song)
})

app.get('/api/artists', (c) => {
  const artists = Object.values(songs.reduce((acc, song) => {
    acc[song.artist] ||= { name: song.artist, cover: song.cover, songIds: [] }
    acc[song.artist].songIds.push(song.id)
    return acc
  }, {}))
  return c.json(artists)
})

app.get('/api/albums', (c) => {
  const albums = Object.values(songs.reduce((acc, song) => {
    acc[song.album] ||= { title: song.album, artist: song.artist, cover: song.cover, year: song.year, songIds: [] }
    acc[song.album].songIds.push(song.id)
    return acc
  }, {}))
  return c.json(albums)
})

app.get('/api/favorites', async (c) => c.json(await getFavorites(c.env.DB)))

app.put('/api/favorites/:songId', async (c) => {
  const songId = c.req.param('songId')
  const song = requireSong(c, songId)
  if (song instanceof Response) return song

  await c.env.DB.prepare(`
    INSERT OR IGNORE INTO favorites (user_id, song_id, created_at)
    VALUES (?, ?, datetime('now'))
  `).bind(USER_ID, songId).run()

  return c.json(await getFavorites(c.env.DB))
})

app.delete('/api/favorites/:songId', async (c) => {
  await c.env.DB.prepare(
    'DELETE FROM favorites WHERE user_id = ? AND song_id = ?'
  ).bind(USER_ID, c.req.param('songId')).run()

  return c.json(await getFavorites(c.env.DB))
})

app.get('/api/history', async (c) => c.json(await getHistory(c.env.DB)))

app.post('/api/history', async (c) => {
  const { songId } = await c.req.json()
  const song = requireSong(c, songId)
  if (song instanceof Response) return song

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM history WHERE user_id = ? AND song_id = ?').bind(USER_ID, songId),
    c.env.DB.prepare(`
      INSERT INTO history (user_id, song_id, played_at)
      VALUES (?, ?, datetime('now'))
    `).bind(USER_ID, songId),
  ])

  return c.json(await getHistory(c.env.DB), 201)
})

app.get('/api/playlists', async (c) => c.json(await getPlaylists(c.env.DB)))

app.post('/api/playlists', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const name = String(body.name || '').trim()
  if (!name) return c.json({ error: 'Playlist name is required' }, 400)

  const id = `pl_${crypto.randomUUID()}`
  await c.env.DB.prepare(`
    INSERT INTO playlists (id, user_id, name, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).bind(id, USER_ID, name.slice(0, 80)).run()

  return c.json(await getPlaylist(c.env.DB, id), 201)
})

app.post('/api/playlists/:playlistId/songs', async (c) => {
  const playlistId = c.req.param('playlistId')
  const playlist = await getPlaylist(c.env.DB, playlistId)
  if (!playlist) return c.json({ error: 'Playlist not found' }, 404)

  const { songId } = await c.req.json()
  const song = requireSong(c, songId)
  if (song instanceof Response) return song

  await c.env.DB.prepare(`
    INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position, added_at)
    VALUES (
      ?,
      ?,
      COALESCE((SELECT MAX(position) + 1 FROM playlist_songs WHERE playlist_id = ?), 0),
      datetime('now')
    )
  `).bind(playlistId, songId, playlistId).run()

  return c.json(await getPlaylist(c.env.DB, playlistId))
})

app.delete('/api/playlists/:playlistId/songs/:songId', async (c) => {
  const playlistId = c.req.param('playlistId')
  const playlist = await getPlaylist(c.env.DB, playlistId)
  if (!playlist) return c.json({ error: 'Playlist not found' }, 404)

  await c.env.DB.prepare(
    'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?'
  ).bind(playlistId, c.req.param('songId')).run()

  return c.json(await getPlaylist(c.env.DB, playlistId))
})

app.delete('/api/playlists/:playlistId', async (c) => {
  const playlistId = c.req.param('playlistId')
  const playlist = await getPlaylist(c.env.DB, playlistId)
  if (!playlist) return c.json({ error: 'Playlist not found' }, 404)

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM playlist_songs WHERE playlist_id = ?').bind(playlistId),
    c.env.DB.prepare('DELETE FROM playlists WHERE id = ? AND user_id = ?').bind(playlistId, USER_ID),
  ])

  return c.body(null, 204)
})

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
