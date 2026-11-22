import { useState } from 'react'
import { Home, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import LotusLogo from './LotusLogo.jsx'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="aarogyam-header">
      <div className="header-container">
        <Link className="brand-anchor" to="/" aria-label="Aarogyam AI home" onClick={() => setMenuOpen(false)}>
          <LotusLogo size={36} />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`aarogyam-nav ${menuOpen ? 'aarogyam-nav--open' : ''}`} aria-label="Main navigation">
          <Link to="/" className="nav-item nav-item--active" onClick={() => setMenuOpen(false)}>
            <Home size={15} className="nav-icon" />
            <span>Home</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
