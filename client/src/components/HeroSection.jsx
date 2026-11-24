import { useState, useRef } from 'react'
import { ArrowRight, Clock, Search, Sparkles, X } from 'lucide-react'
import heroBannerImg from '../assets/hero-banner.jpg'
import yogiSvg from '../assets/yogi-meditation.svg'
import { useAuth } from '../context/AuthContext.jsx'

const topicList = [
  { label: 'Headache', icon: '🧠' },
  { label: 'Cough', icon: '🫁' },
  { label: 'Back Pain', icon: '🦴' },
  { label: 'Stress', icon: '🧘' },
  { label: 'Acidity', icon: '🫄' },
  { label: 'Common cold', icon: '❄️' },
]

export default function HeroSection({ onSearch, isSearching = false, searchError = '' }) {
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const heroRef = useRef(null)
  const { isLoggedIn, recentQueries } = useAuth()

  async function submitSearch(event) {
    event.preventDefault()
    if (!query.trim() || isSearching) return
    await onSearch?.(query.trim())
  }

  function chooseTopic(topic) {
    setQuery(topic)
    document.getElementById('wellness-search')?.focus()
    onSearch?.(topic)
  }

  return (
    <section
      ref={heroRef}
      className={`hero-cinematic ${searchFocused ? 'hero-cinematic--focused' : ''}`}
      aria-labelledby="hero-title"
    >
      {/* Background Central Artwork Layer with Zoom & Blur */}
      <div className="hero-backdrop-container" aria-hidden="true">
        <img
          src={heroBannerImg}
          alt=""
          className={`hero-backdrop-image ${searchFocused ? 'hero-backdrop-image--zoomed' : ''}`}
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextElementSibling?.classList.remove('hidden')
          }}
        />
        <div className="hero-backdrop-fallback hidden">
          <img src={yogiSvg} alt="" className="hero-backdrop-vector" />
        </div>

        {/* Ambient Gradient Overlays for perfect legibility & golden glow */}
        <div className="hero-backdrop-vignette" />
        <div className={`hero-backdrop-scrim ${searchFocused ? 'hero-backdrop-scrim--active' : ''}`} />
        <div className="hero-sacred-aura" />

        {/* Sacred Geometric Mandala Watermark */}
        <div className="sacred-mandala-wrap">
          <svg
            className="sacred-mandala"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.35"
            aria-hidden="true"
          >
            <circle cx="50" cy="50" r="45" strokeDasharray="1 2" />
            <circle cx="50" cy="50" r="35" />
            <circle cx="50" cy="50" r="25" strokeDasharray="2 2" />
            <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" />
            <polygon points="50,15 62,38 85,50 62,62 50,85 38,62 15,50 38,38" />
          </svg>
        </div>
      </div>

      {/* Foreground Content Layer Overlaying the Center Yogi */}
      <div className="hero-cinematic__inner">
        <div className="hero-cinematic__center-content">
          {/* Pulsing Eyebrow Badge */}
          <div className="hero-badge">
            <span className="relative flex h-2.5 w-2.5">
            </span>
            <span>ANCIENT WISDOM · INTELLIGENT WELLNESS</span>
          </div>

          <h1 id="hero-title" className="hero-cinematic__title">
            Ancient Wisdom.<br />
            <em>Intelligent Wellness.</em>
          </h1>

          <p className="hero-cinematic__subtitle">
            Discover bespoke natural remedies, revitalizing pranayama, and mindful yoga flows curated by timeless Vedic tradition and harmonized through intuitive modern intelligence.
          </p>

          {/* Interactive Search Bar Capsule */}
          <div className="hero-search-wrapper">
            <div className="hero-search-glow" aria-hidden="true" />
            <form
              className={`hero-search-capsule hero-search-capsule--center ${searchFocused ? 'hero-search-capsule--focused' : ''
                }`}
              onSubmit={submitSearch}
              onClick={() => document.getElementById('wellness-search')?.focus()}
              role="search"
            >
              <label className="visually-hidden" htmlFor="wellness-search">
                What are you feeling today?
              </label>
              <div className="search-icon-slot">
                <Search size={22} className="search-magnifier" />
              </div>
              <input
                id="wellness-search"
                type="search"
                placeholder="What are you feeling today? (e.g. Migraine, sleeplessness)"
                value={query}
                maxLength={180}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {query && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setQuery('')
                    document.getElementById('wellness-search')?.focus()
                  }}
                  className="p-1.5 rounded-full text-[#8c7e6d] hover:text-[#072316] hover:bg-black/5 transition-colors mr-1"
                  aria-label="Clear search input"
                  title="Clear"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                className="search-circle-submit"
                aria-label="Explore wellness guidance"
                disabled={isSearching}
              >
                <ArrowRight size={19} />
              </button>
            </form>
          </div>

          {isSearching && (
            <div className="searching-indicator searching-indicator--center" role="status">
              <Sparkles size={16} className="pulse-spin text-[#f59e0b]" />
              <span>Consulting Ayurvedic wisdom &amp; AI...</span>
            </div>
          )}

          {searchError && (
            <p className="hero-search-error hero-search-error--center" role="alert">
              {searchError}
            </p>
          )}

          {/* Saved Past 2 Queries on Account */}
          {isLoggedIn && recentQueries?.length > 0 && (
            <div className="saved-queries-account-row inline-flex flex-wrap items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#ffffff]/90 backdrop-blur-md border border-[#d97706]/20 shadow-[0_4px_16px_rgba(217,119,6,0.06)] animate-fadeIn">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b45309] flex items-center gap-1.5">
                <Clock size={12} className="text-[#d97706]" />
                <span>Saved Inquiries:</span>
              </span>
              {recentQueries.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => chooseTopic(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 hover:border-[#065f46]/40 text-[#065f46] text-[12px] font-semibold transition-all shadow-2xs hover:scale-105"
                  title={`Re-explore ${item}`}
                >
                  <span>{item}</span>
                  <ArrowRight size={10} className="text-[#065f46]/70" />
                </button>
              ))}
            </div>
          )}

          {/* Try Searching For Topic Chips */}
          <div className={`try-searching-row try-searching-row--center ${searchFocused ? 'try-searching-row--elevated' : ''}`}>
            <div className="try-searching-label">
              <span className="dash-line" />
              <span>Try searching for:</span>
              <span className="dash-line" />
            </div>
            <div className="topic-chips-shelf">
              {topicList.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className="ayur-chip ayur-chip--glass"
                  aria-label={item.label}
                  onClick={() => chooseTopic(item.label)}
                >
                  <span className="chip-icon">{item.icon}</span>
                  <span className="chip-text">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
