import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, ChevronDown, Clock, Home, LogOut, Menu, Sparkles, Trash2, User, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LotusLogo from './LotusLogo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, recentQueries, logout, removeSearchQuery, openAuthModal } = useAuth()

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleAnchorClick(anchorId) {
    setMenuOpen(false)
    if (location.pathname !== '/') return
    const element = document.getElementById(anchorId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleQueryClick(query) {
    setUserDropdownOpen(false)
    setMenuOpen(false)
    navigate(`/results?q=${encodeURIComponent(query)}`)
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

          {/* Mobile Drawer Account & Saved Searches */}
          <div className="w-full pt-4 mt-2 border-t border-[#d97706]/15 md:hidden">
            {isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#ffffff] border border-[#d97706]/15 shadow-xs">
                  <span className="w-9 h-9 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] flex items-center justify-center text-sm shadow-inner shrink-0">
                    {user.avatar || '🌿'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#072316] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#8c7e6d] truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    className="p-1.5 text-[#b91c1c] hover:bg-[#fef2f2] rounded-lg transition-colors text-xs font-semibold shrink-0"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>

                {recentQueries.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45309] flex items-center gap-1">
                      <Clock size={11} /> Saved Inquiries (Max 2):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {recentQueries.map((query) => (
                        <div
                          key={query}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffffff] border border-[#d97706]/20 text-xs font-semibold text-[#072316] shadow-2xs"
                        >
                          <button
                            type="button"
                            onClick={() => handleQueryClick(query)}
                            className="hover:text-[#b45309] transition-colors"
                          >
                            ● {query}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSearchQuery(query)}
                            className="text-[#8c7e6d] hover:text-[#b91c1c] ml-1"
                            aria-label={`Remove saved search ${query}`}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  openAuthModal()
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#1e392a] text-[#ffffff] font-semibold text-[13px] shadow-sm"
              >
                <User size={15} />
                <span>Sign In to Your Account</span>
              </button>
            )}

            <Link
              to="/results/demo"
              onClick={() => setMenuOpen(false)}
              className="mt-2.5 w-full inline-flex items-center justify-center gap-2 py-2 rounded-full bg-[#f7efe2] border border-[#d97706]/20 text-[#072316] font-semibold text-[13px]"
            >
              <Sparkles size={14} className="text-[#d97706]" />
              <span>Consult Sanctuary (Demo)</span>
            </Link>
          </div>
        </nav>

        {/* Right CTA Slot */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/results/demo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e392a] text-[#ffffff] font-semibold text-[13px] tracking-wide hover:bg-[#15291e] hover:shadow-[0_6px_20px_rgba(30,57,42,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Sparkles size={14} className="text-[#f59e0b]" />
            <span>Consult Sanctuary</span>
          </Link>

          {/* User Account Button & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffffff] border border-[#d97706]/20 text-[#072316] font-semibold text-[12.5px] hover:bg-[#f7efe2] transition-all shadow-xs"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                aria-label="User account menu"
              >
                <span className="w-6 h-6 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] flex items-center justify-center text-xs">
                  {user.avatar || '🌿'}
                </span>
                <span className="max-w-[90px] truncate">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={13} className={`text-[#8c7e6d] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f7efe2] border border-[#d97706]/20 text-[#072316] font-semibold text-[12.5px] hover:bg-[#ffffff] hover:border-[#d97706]/40 transition-all shadow-2xs"
                aria-label="Sign in to your account"
              >
                <User size={14} className="text-[#d97706]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {userDropdownOpen && isLoggedIn && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#ffffff] border border-[#d97706]/20 shadow-[0_12px_36px_rgba(21,41,30,0.12)] p-4 z-50 animate-fadeIn"
                role="menu"
              >
                <div className="pb-3 border-b border-[#d97706]/10 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] flex items-center justify-center text-sm shadow-inner">
                      {user.avatar || '🌿'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#072316] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#8c7e6d] truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Saved Inquiries (Past 2 Queries) */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45309] flex items-center gap-1">
                      <Clock size={11} /> Saved Inquiries (Max 2)
                    </span>
                    <span className="text-[10px] text-[#8c7e6d]">{recentQueries.length}/2 saved</span>
                  </div>

                  {recentQueries.length > 0 ? (
                    <div className="space-y-1.5">
                      {recentQueries.map((query) => (
                        <div
                          key={query}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#f7efe2]/60 hover:bg-[#f7efe2] border border-[#d97706]/15 transition-colors group"
                        >
                          <button
                            type="button"
                            onClick={() => handleQueryClick(query)}
                            className="flex-1 flex items-center gap-2 text-left min-w-0 text-[12.5px] font-semibold text-[#072316] group-hover:text-[#b45309] transition-colors"
                            title={`Explore remedies for ${query}`}
                          >
                            <span className="text-[#d97706]">●</span>
                            <span className="truncate">{query}</span>
                            <ArrowUpRight size={13} className="shrink-0 text-[#8c7e6d] group-hover:text-[#b45309]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSearchQuery(query)
                            }}
                            className="p-1 rounded-md text-[#8c7e6d] hover:text-[#b91c1c] hover:bg-black/5 transition-colors"
                            aria-label={`Remove saved search ${query}`}
                            title="Remove"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11.5px] text-[#8c7e6d] italic py-1">
                      Search any concern to save your past 2 inquiries automatically.
                    </p>
                  )}
                </div>

                {/* Logout Button */}
                <div className="pt-2 border-t border-[#d97706]/10">
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setUserDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12.5px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2] transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle & Account */}
        <div className="flex sm:hidden items-center gap-2">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] flex items-center justify-center text-xs shadow-xs"
              title={`${user.name} - Open menu`}
              aria-label="User account and navigation"
            >
              {user.avatar || '🌿'}
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="px-2.5 py-1 rounded-full border border-[#d97706]/20 text-[#072316] hover:bg-[#1e392a]/8 text-xs font-semibold"
            >
              Sign In
            </button>
          )}

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
      </div>
    </header>
  )
}
