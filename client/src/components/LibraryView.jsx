import { Heart, ListMusic, Mic2, Music2 } from 'lucide-react'
import MediaCard from './MediaCard.jsx'
import SongRow from './SongRow.jsx'

export default function LibraryView({ type, title, subtitle, songs, favorites, player, onFavorite, onAdd }) {
  if (type === 'albums') {
    const albums = [...new Map(songs.map((song) => [song.album, song])).values()]
    return <GridPage title={title} subtitle={subtitle}><div className="media-grid wide">{albums.map((song) => <MediaCard key={song.album} image={song.cover} title={song.album} subtitle={song.artist} eyebrow={`${songs.filter((item) => item.album === song.album).length} tracks`} onPlay={() => player.playSong(song)} />)}</div></GridPage>
  }

  if (type === 'artists') {
    const artists = [...new Map(songs.map((song) => [song.artist, song])).values()]
    return <GridPage title={title} subtitle={subtitle}><div className="media-grid wide artists">{artists.map((song) => <MediaCard key={song.artist} image={song.cover} title={song.artist} subtitle={`${songs.filter((item) => item.artist === song.artist).length} songs`} eyebrow="Artist" onPlay={() => player.playSong(song)} />)}</div></GridPage>
  }

  const EmptyIcon = type === 'favorites' ? Heart : type === 'playlist' ? ListMusic : Music2
  return (
    <GridPage title={title} subtitle={subtitle}>
      {songs.length ? (
        <div className="song-list">
          {songs.map((song) => <SongRow key={song.id} song={song} active={player.currentId === song.id} playing={player.isPlaying} favorite={favorites.has(song.id)} onPlay={() => player.playSong(song)} onFavorite={() => onFavorite(song.id)} onAdd={() => onAdd(song.id)} />)}
        </div>
      ) : <div className="empty-state"><EmptyIcon size={30} /><h3>Nothing here yet</h3><p>Add music or change your search.</p></div>}
    </GridPage>
  )
}

function GridPage({ title, subtitle, children }) {
  return (
    <div className="view-stack">
      <section className="page-intro"><h1>{title}</h1><p>{subtitle}</p></section>
      {children}
    </div>
  )
}
