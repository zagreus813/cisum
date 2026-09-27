import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { songs } from '../../client/worker/library.generated.js'
import { readDb, updateDb } from './store.js'

const app = new Hono()
app.use('/api/*', cors({ origin: ['http://localhost:5173'], allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))

const findSong = (id) => songs.find((song) => song.id === id)
const requireSong = (c, id) => {
  const song = findSong(id)
  if (!song) return c.json({ error: 'Song not found' }, 404)
  return song
}

app.get('/api/health', (c) => c.json({ ok: true, service: 'echovault-api' }))

app.get('/api/bootstrap', (c) => {
  const db = readDb()
  return c.json({
    user: db.user,
    songs: [...songs].sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    favorites: db.favorites,
    history: db.history,
    playlists: db.playlists,
  })
})

app.get('/api/songs', (c) => {
  const q = (c.req.query('q') || '').toLowerCase().trim()
  const result = !q ? songs : songs.filter((song) => [song.title, song.artist, song.album, song.genre].some((value) => value.toLowerCase().includes(q)))
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

app.get('/api/favorites', (c) => c.json(readDb().favorites))
app.put('/api/favorites/:songId', (c) => {
  const songId = c.req.param('songId')
  const song = requireSong(c, songId)
  if (song instanceof Response) return song
  const db = updateDb((draft) => {
    if (!draft.favorites.includes(songId)) draft.favorites.push(songId)
    return draft
  })
  return c.json(db.favorites)
})
app.delete('/api/favorites/:songId', (c) => {
  const songId = c.req.param('songId')
  const db = updateDb((draft) => {
    draft.favorites = draft.favorites.filter((id) => id !== songId)
    return draft
  })
  return c.json(db.favorites)
})

app.get('/api/history', (c) => c.json(readDb().history))
app.post('/api/history', async (c) => {
  const { songId } = await c.req.json()
  const song = requireSong(c, songId)
  if (song instanceof Response) return song
  const db = updateDb((draft) => {
    draft.history = [songId, ...draft.history.filter((id) => id !== songId)].slice(0, 50)
    return draft
  })
  return c.json(db.history, 201)
})

app.get('/api/playlists', (c) => c.json(readDb().playlists))
app.post('/api/playlists', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const name = String(body.name || '').trim()
  if (!name) return c.json({ error: 'Playlist name is required' }, 400)
  const playlist = { id: `pl_${Date.now().toString(36)}`, name: name.slice(0, 80), songIds: [], createdAt: new Date().toISOString() }
  updateDb((draft) => { draft.playlists.push(playlist); return draft })
  return c.json(playlist, 201)
})

app.post('/api/playlists/:playlistId/songs', async (c) => {
  const { songId } = await c.req.json()
  const song = requireSong(c, songId)
  if (song instanceof Response) return song
  let found = null
  updateDb((draft) => {
    const playlist = draft.playlists.find((item) => item.id === c.req.param('playlistId'))
    if (!playlist) return draft
    if (!playlist.songIds.includes(songId)) playlist.songIds.push(songId)
    found = structuredClone(playlist)
    return draft
  })
  if (!found) return c.json({ error: 'Playlist not found' }, 404)
  return c.json(found)
})

app.delete('/api/playlists/:playlistId/songs/:songId', (c) => {
  let found = null
  updateDb((draft) => {
    const playlist = draft.playlists.find((item) => item.id === c.req.param('playlistId'))
    if (!playlist) return draft
    playlist.songIds = playlist.songIds.filter((id) => id !== c.req.param('songId'))
    found = structuredClone(playlist)
    return draft
  })
  if (!found) return c.json({ error: 'Playlist not found' }, 404)
  return c.json(found)
})

app.delete('/api/playlists/:playlistId', (c) => {
  const before = readDb()
  if (!before.playlists.some((item) => item.id === c.req.param('playlistId'))) return c.json({ error: 'Playlist not found' }, 404)
  updateDb((draft) => {
    draft.playlists = draft.playlists.filter((item) => item.id !== c.req.param('playlistId'))
    return draft
  })
  return c.body(null, 204)
})

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`EchoVault API running on http://localhost:${info.port}`)
})
