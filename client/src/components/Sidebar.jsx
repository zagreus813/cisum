import { Album, Clock3, Heart, Home, Library, ListMusic, Mic2, Music2, Plus } from 'lucide-react'

const items = [
  ['home', Home, 'Home'],
  ['songs', Library, 'Songs'],
  ['albums', Album, 'Albums'],
  ['artists', Mic2, 'Artists'],
  ['favorites', Heart, 'Liked'],
  ['history', Clock3, 'Recent'],
]

export default function Sidebar({ page, onPageChange, playlists, onNewPlaylist }) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onPageChange('home')}>
        <span className="brand-mark"><Music2 size={18} /></span>
        <span>EchoVault</span>
      </button>

      <nav className="nav-stack" aria-label="Main navigation">
        {items.map(([id, Icon, label]) => (
          <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => onPageChange(id)}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <section className="playlist-nav">
        <div className="section-label-row">
          <span>Playlists</span>
          <button className="mini-icon" onClick={onNewPlaylist} aria-label="Create playlist"><Plus size={15} /></button>
        </div>
        <div className="playlist-links">
          {playlists.map((playlist) => (
            <button key={playlist.id} className={`playlist-link ${page === `playlist:${playlist.id}` ? 'active' : ''}`} onClick={() => onPageChange(`playlist:${playlist.id}`)}>
              <ListMusic size={15} />
              <span>{playlist.name}</span>
            </button>
          ))}
          {!playlists.length && <span className="sidebar-empty">No playlists yet</span>}
        </div>
      </section>
    </aside>
  )
}
