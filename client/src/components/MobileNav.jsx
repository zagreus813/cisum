import { Heart, Home, Library, Menu } from 'lucide-react'

const items = [
  ['home', Home, 'Home'],
  ['songs', Library, 'Library'],
  ['favorites', Heart, 'Liked'],
  ['more', Menu, 'More'],
]

export default function MobileNav({ page, onPageChange }) {
  const activePage = page.startsWith('playlist:') || ['albums', 'artists', 'history'].includes(page) ? 'more' : page
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {items.map(([id, Icon, label]) => (
        <button key={id} className={activePage === id ? 'active' : ''} onClick={() => onPageChange(id)}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
