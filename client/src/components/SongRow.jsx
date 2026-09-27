import { Heart, Pause, Play, Plus } from 'lucide-react'

function formatSeconds(total) {
  if (!total) return '—'
  const min = Math.floor(total / 60)
  const sec = Math.floor(total % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

export default function SongRow({ song, active, playing, favorite, onPlay, onFavorite, onAdd }) {
  return (
    <div className={`song-row ${active ? 'active' : ''}`}>
      <button className="song-main" onClick={onPlay} aria-label={`Play ${song.title}`}>
        <span className="song-cover-wrap">
          <img src={song.cover} alt="" loading="lazy" />
          <span className="cover-play">{active && playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</span>
        </span>
        <span className="song-copy">
          <strong>{song.title}</strong>
          <small>{song.artist}</small>
        </span>
      </button>
      <span className="song-album">{song.album}</span>
      <span className="song-duration">{formatSeconds(song.duration)}</span>
      <div className="song-actions">
        <button className={`row-action ${favorite ? 'selected' : ''}`} onClick={onFavorite} aria-label="Like song">
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <button className="row-action" onClick={onAdd} aria-label="Add to playlist"><Plus size={18} /></button>
      </div>
    </div>
  )
}
