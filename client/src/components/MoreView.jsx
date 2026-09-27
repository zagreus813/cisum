import { Album, Clock3, ListMusic, Mic2, Plus } from 'lucide-react'

export default function MoreView({ playlists, onPageChange, onNewPlaylist }) {
  return (
    <div className="view-stack">
      <section className="page-intro"><h1>More</h1><p>Albums, artists, recent plays and playlists.</p></section>
      <div className="more-grid">
        <button onClick={() => onPageChange('albums')}><Album size={20} /><span><strong>Albums</strong><small>Browse releases</small></span></button>
        <button onClick={() => onPageChange('artists')}><Mic2 size={20} /><span><strong>Artists</strong><small>Browse artists</small></span></button>
        <button onClick={() => onPageChange('history')}><Clock3 size={20} /><span><strong>Recently played</strong><small>Your listening history</small></span></button>
        <button onClick={onNewPlaylist}><Plus size={20} /><span><strong>New playlist</strong><small>Create a collection</small></span></button>
      </div>
      <section>
        <div className="section-heading"><h2>Playlists</h2></div>
        <div className="playlist-grid">
          {playlists.map((playlist) => <button key={playlist.id} onClick={() => onPageChange(`playlist:${playlist.id}`)}><ListMusic size={19} /><span><strong>{playlist.name}</strong><small>{playlist.songIds.length} tracks</small></span></button>)}
          {!playlists.length && <div className="empty-inline">No playlists yet.</div>}
        </div>
      </section>
    </div>
  )
}
