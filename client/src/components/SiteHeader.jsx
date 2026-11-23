import { useState } from 'react'
import { ArrowUpRight, Compass, Heart, Home, Info, Leaf, Menu, Sparkles, User, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import LotusLogo from './LotusLogo.jsx'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  function handleAnchorClick(anchorId) {
    setMenuOpen(false)
    if (location.pathname !== '/') return
    const element = document.getElementById(anchorId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="aarogyam-header sticky top-0 z-50 bg-[#fbf6ee]/90 backdrop-blur-xl border-b border-[#d97706]/15 shadow-[0_10px_30px_rgba(39,27,18,0.06)]">
      <div className="header-container max-w-[1240px] h-20 mx-auto px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <Link className="brand-anchor group" to="/" aria-label="Aarogyam AI home" onClick={() => setMenuOpen(false)}>
          <LotusLogo size={38} />
        </Link>

        {/* Navigation (Single responsive nav for desktop and mobile drawer) */}
        <nav
          className={`aarogyam-nav ${menuOpen ? 'aarogyam-nav--open' : ''}`}
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className={`nav-item ${location.pathname === '/' ? 'nav-item--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <Home size={15} className="nav-icon text-[#d97706]" />
            <span>Home</span>
          </Link>

          <a
            href="/#how-it-works"
            className="nav-item"
            onClick={() => handleAnchorClick('how-it-works')}
          >
            How It Works
          </a>

          <a
            href="/#wellness"
            className="nav-item"
            onClick={() => handleAnchorClick('wellness')}
          >
            Wellness Library
          </a>

          <a
            href="/#about"
            className="nav-item"
            onClick={() => handleAnchorClick('about')}
          >
            About / Philosophy
          </a>
        </nav>

        {/* Right CTA Slot */}
        <div className="hidden sm:flex items-center gap-3.5">
          <Link
            to="/results/demo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1e392a] text-[#ffffff] font-semibold text-[13px] tracking-wide hover:bg-[#15291e] hover:shadow-[0_6px_20px_rgba(30,57,42,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Sparkles size={14} className="text-[#f59e0b]" />
            <span>Consult Sanctuary</span>
          </Link>

          <div
            className="w-9 h-9 rounded-full bg-[#1e392a]/10 border border-[#d97706]/20 flex items-center justify-center text-[#1e392a] shadow-xs"
            title="Ayurvedic Wellness Sanctuary"
          >
            <User size={16} />
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="menu-toggle md:hidden p-2 rounded-xl text-[#271b12] hover:bg-[#1e392a]/8 transition-colors"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}
