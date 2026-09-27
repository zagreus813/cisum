import { useCallback, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import Header from './components/Header.jsx'
import HomeView from './components/HomeView.jsx'
import LibraryView from './components/LibraryView.jsx'
import MobileNav from './components/MobileNav.jsx'
import MoreView from './components/MoreView.jsx'
import Player from './components/Player.jsx'
import Sidebar from './components/Sidebar.jsx'
import { useAudioPlayer } from './hooks/useAudioPlayer.js'
import { api } from './lib/api.js'

function initialTheme() {
  const stored = localStorage.getItem('echovault-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function App() {
  const [data, setData] = useState({ songs: [], favorites: [], playlists: [], history: [], user: null })
  const [page, setPage] = useState('home')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [pickerSongId, setPickerSongId] = useState(null)
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('echovault-theme', theme)
  }, [theme])

  useEffect(() => {
    api.bootstrap().then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])

  const addHistory = useCallback((song) => {
    setData((current) => ({ ...current, history: [song.id, ...current.history.filter((id) => id !== song.id)].slice(0, 25) }))
    api.addHistory(song.id).catch(() => {})
  }, [])

  const player = useAudioPlayer(data.songs, addHistory)
  const favoriteSet = useMemo(() => new Set(data.favorites), [data.favorites])

  const filteredSongs = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return data.songs
    return data.songs.filter((song) => [song.title, song.artist, song.album, song.genre].some((field) => String(field || '').toLowerCase().includes(value)))
  }, [data.songs, query])

  const recentSongs = useMemo(() => data.history.map((id) => data.songs.find((song) => song.id === id)).filter(Boolean), [data.history, data.songs])

  const toggleFavorite = async (songId) => {
    const isFavorite = favoriteSet.has(songId)
    setData((current) => ({ ...current, favorites: isFavorite ? current.favorites.filter((id) => id !== songId) : [...current.favorites, songId] }))
    try { if (isFavorite) await api.removeFavorite(songId); else await api.addFavorite(songId) }
    catch { setToast('Could not update favorite') }
  }

  const createPlaylist = async () => {
    const name = window.prompt('Playlist name')
    if (!name?.trim()) return
    try {
      const playlist = await api.createPlaylist(name.trim())
      setData((current) => ({ ...current, playlists: [...current.playlists, playlist] }))
      setPage(`playlist:${playlist.id}`)
    } catch (err) { setToast(err.message) }
  }

  const addToPlaylist = async (playlistId, songId) => {
    try {
      const updated = await api.addToPlaylist(playlistId, songId)
      setData((current) => ({ ...current, playlists: current.playlists.map((item) => item.id === updated.id ? updated : item) }))
      setToast(`Added to ${updated.name}`)
      setPickerSongId(null)
    } catch (err) { setToast(err.message) }
  }

  const pageSongs = () => {
    if (page === 'favorites') return filteredSongs.filter((song) => favoriteSet.has(song.id))
    if (page === 'history') return recentSongs.filter((song) => filteredSongs.some((item) => item.id === song.id))
    if (page.startsWith('playlist:')) {
      const playlist = data.playlists.find((item) => item.id === page.split(':')[1])
      return (playlist?.songIds || []).map((id) => data.songs.find((song) => song.id === id)).filter(Boolean).filter((song) => filteredSongs.some((item) => item.id === song.id))
    }
    return filteredSongs
  }

  const currentPlaylist = page.startsWith('playlist:') ? data.playlists.find((item) => item.id === page.split(':')[1]) : null

  if (loading) return <div className="splash"><div className="spinner" /><strong>Opening EchoVault</strong><span>Loading your library…</span></div>
  if (error) return <div className="splash error"><strong>Could not load EchoVault</strong><span>{error}</span></div>

  return (
    <div className="app-shell">
      <Sidebar page={page} onPageChange={setPage} playlists={data.playlists} onNewPlaylist={createPlaylist} />
      <div className="main-shell">
        <Header query={query} onQueryChange={setQuery} theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} />
        <main className="content-scroll">
          {page === 'home' ? <HomeView songs={filteredSongs} recentSongs={recentSongs} favorites={favoriteSet} player={player} onFavorite={toggleFavorite} onAdd={setPickerSongId} onOpenPage={setPage} />
          : page === 'albums' ? <LibraryView type="albums" title="Albums" subtitle="Browse your collection by album." songs={filteredSongs} favorites={favoriteSet} player={player} onFavorite={toggleFavorite} onAdd={setPickerSongId} />
          : page === 'artists' ? <LibraryView type="artists" title="Artists" subtitle="Everyone in your personal library." songs={filteredSongs} favorites={favoriteSet} player={player} onFavorite={toggleFavorite} onAdd={setPickerSongId} />
          : page === 'more' ? <MoreView playlists={data.playlists} onPageChange={setPage} onNewPlaylist={createPlaylist} />
          : <LibraryView type={page.startsWith('playlist:') ? 'playlist' : page} title={currentPlaylist?.name || (page === 'favorites' ? 'Liked Songs' : page === 'history' ? 'Recently Played' : 'All Songs')} subtitle={currentPlaylist ? `${currentPlaylist.songIds.length} tracks` : page === 'favorites' ? `${pageSongs().length} saved tracks` : page === 'history' ? 'Your latest listening activity.' : `${pageSongs().length} tracks in your library.`} songs={pageSongs()} favorites={favoriteSet} player={player} onFavorite={toggleFavorite} onAdd={setPickerSongId} />}
        </main>
      </div>

      <Player player={player} favorite={player.currentSong ? favoriteSet.has(player.currentSong.id) : false} onFavorite={() => player.currentSong && toggleFavorite(player.currentSong.id)} />
      <MobileNav page={page} onPageChange={setPage} />

      {pickerSongId && (
        <div className="modal-backdrop" onMouseDown={() => setPickerSongId(null)}>
          <div className="playlist-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head"><div><span className="eyebrow">Add track</span><h3>Choose a playlist</h3></div><button className="icon-button" onClick={() => setPickerSongId(null)}><X size={18} /></button></div>
            {data.playlists.length ? data.playlists.map((playlist) => <button key={playlist.id} className="playlist-choice" onClick={() => addToPlaylist(playlist.id, pickerSongId)}><span>{playlist.name}</span><small>{playlist.songIds.length} tracks</small></button>) : <p className="muted">Create a playlist first.</p>}
          </div>
        </div>
      )}

      {toast && <button className="toast" onClick={() => setToast('')}>{toast}<X size={15} /></button>}
    </div>
  )
}

export default App
