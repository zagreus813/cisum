import { Moon, Search, Sun } from 'lucide-react'

export default function Header({ query, onQueryChange, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <span className="brand-dot" />
        <span>EchoVault</span>
      </div>

      <label className="search-box">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search your music"
          aria-label="Search music"
        />
      </label>

      <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}
