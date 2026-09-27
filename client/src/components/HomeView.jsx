import { ArrowRight, Play } from 'lucide-react'
import MediaCard from './MediaCard.jsx'
import SongRow from './SongRow.jsx'

export default function HomeView({ songs, recentSongs, favorites, player, onFavorite, onAdd, onOpenPage }) {
  const albums = [...new Map(songs.map((song) => [song.album, song])).values()].slice(0, 4)
  const latest = songs.slice(0, 6)
  const firstSong = songs[0]

  return (
    <div className="view-stack">
      <section className="home-intro">
        <div>
          <span className="eyebrow">Personal library</span>
          <h1>Your music, without the noise.</h1>
          <p>{songs.length} tracks ready to play.</p>
        </div>
        {firstSong && <button className="primary-button" onClick={() => player.playSong(firstSong)}><Play size={17} fill="currentColor" /> Play all</button>}
      </section>

      {recentSongs.length > 0 && (
        <section>
          <div className="section-heading"><h2>Continue listening</h2></div>
          <div className="quick-grid">
            {recentSongs.slice(0, 3).map((song) => (
              <button className="quick-card" key={song.id} onClick={() => player.playSong(song)}>
                <img src={song.cover} alt="" />
                <span><strong>{song.title}</strong><small>{song.artist}</small></span>
                <span className="quick-play"><Play size={16} fill="currentColor" /></span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="section-heading">
          <h2>Recently added</h2>
          <button className="text-button" onClick={() => onOpenPage('albums')}>Albums <ArrowRight size={15} /></button>
        </div>
        <div className="media-grid">
          {albums.map((song) => <MediaCard key={song.album} image={song.cover} title={song.album} subtitle={song.artist} onPlay={() => player.playSong(song)} />)}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>Tracks</h2>
          <button className="text-button" onClick={() => onOpenPage('songs')}>See all <ArrowRight size={15} /></button>
        </div>
        <div className="song-list">
          {latest.map((song) => (
            <SongRow key={song.id} song={song} active={player.currentId === song.id} playing={player.isPlaying} favorite={favorites.has(song.id)} onPlay={() => player.playSong(song)} onFavorite={() => onFavorite(song.id)} onAdd={() => onAdd(song.id)} />
          ))}
        </div>
      </section>
    </div>
  )
}
