import { useState, useRef, useEffect } from 'react'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import heroBannerImg from '../assets/hero-banner.jpg'
import yogiSvg from '../assets/yogi-meditation.svg'

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
      </div>

      {/* Foreground Content Layer Overlaying the Center Yogi */}
      <div className="hero-cinematic__inner">
        <div className="hero-cinematic__center-content">
          <div className="hero-badge">
            <span className="hero-badge__dot" />
            <span>ANCIENT WISDOM · INTELLIGENT WELLNESS</span>
          </div>

          <h1 id="hero-title" className="hero-cinematic__title">
            Ancient Wisdom.<br />
            <em>Intelligent Wellness.</em>
          </h1>

          <p className="hero-cinematic__subtitle">
            Discover natural wellness guidance through the wisdom of Ayurveda, yoga and the power of AI.
          </p>

          {/* Interactive Search Bar Capsule */}
          <form
            className={`hero-search-capsule hero-search-capsule--center ${
              searchFocused ? 'hero-search-capsule--focused' : ''
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
              placeholder="What are you feeling today?"
              value={query}
              maxLength={180}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <button
              type="submit"
              className="search-circle-submit"
              aria-label="Explore wellness guidance"
              disabled={isSearching}
            >
              <ArrowRight size={19} />
            </button>
          </form>

          {isSearching && (
            <div className="searching-indicator searching-indicator--center">
              <Sparkles size={15} className="pulse-spin" />
              <span>Consulting Ayurvedic wisdom & AI...</span>
            </div>
          )}

          {searchError && (
            <p className="hero-search-error hero-search-error--center" role="alert">
              {searchError}
            </p>
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
