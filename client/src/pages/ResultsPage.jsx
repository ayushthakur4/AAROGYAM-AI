import { useState } from 'react'
import { ArrowLeft, CircleAlert, Clock3, ExternalLink, Info, Leaf, Play, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import RecommendationList from '../components/RecommendationList.jsx'
import { mockWellnessGuide } from '../data/mockWellnessGuide.js'
import { getApiBaseUrl } from '../utils/api.js'
import warriorArtwork from '../assets/yoga-warrior.svg'
import seatedArtwork from '../assets/yoga-seated.svg'
import stretchArtwork from '../assets/yoga-stretch.svg'

function getYouTubeSearches(topic) {
  const safeTopic = (topic || 'wellness').trim().slice(0, 120)
  const searches = [
    {
      title: `Warrior pose for ${safeTopic}`,
      term: `${safeTopic} gentle warrior yoga pose`,
      thumbnail: warriorArtwork,
      alt: 'Illustration of a gentle warrior yoga pose',
    },
    {
      title: 'Seated yoga for relaxation',
      term: 'seated yoga pose relaxation for beginners',
      thumbnail: seatedArtwork,
      alt: 'Illustration of a seated yoga pose',
    },
    {
      title: 'Gentle side stretch',
      term: 'gentle seated side stretch yoga pose',
      thumbnail: stretchArtwork,
      alt: 'Illustration of a seated side stretch yoga pose',
    },
  ]
  return searches.map((search, index) => ({
    ...search,
    type: 'youtube-search',
    artwork: `video-art--yoga-${index + 1}`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(search.term)}`,
  }))
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState('remedies')
  const [safetyNoticeDismissed, setSafetyNoticeDismissed] = useState(false)
  const [inlineSearchQuery, setInlineSearchQuery] = useState('')
  const [isSearchingNew, setIsSearchingNew] = useState(false)
  const [searchError, setSearchError] = useState('')

  const { pathname, state } = useLocation()
  const navigate = useNavigate()

  const isSample = pathname === '/results/demo'
  const guide = state?.guide || (isSample ? mockWellnessGuide : null)

  if (!guide) return <Navigate to="/" replace />

  const youtubeSearches = getYouTubeSearches(guide.query)

  async function handleInlineSearch(e) {
    e.preventDefault()
    if (!inlineSearchQuery.trim() || isSearchingNew) return

    setIsSearchingNew(true)
    setSearchError('')
    try {
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inlineSearchQuery.trim() }),
        signal: AbortSignal.timeout(75_000),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Could not fetch guide.')
      setInlineSearchQuery('')
      navigate('/results', { state: { guide: payload } })
    } catch (err) {
      setSearchError(err.message || 'Could not search topic. Please try again.')
    } finally {
      setIsSearchingNew(false)
    }
  }

  return (
    <div className="app-shell ayur-theme results-theme">
      <SiteHeader />

      <main className="results-page section-wrap">
        {/* Top Back Link & In-Page Search */}
        <div className="results-top-nav-bar">
          <Link className="back-link" to="/">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          <form className="results-inline-search" onSubmit={handleInlineSearch} role="search">
            <Search size={15} className="results-search-icon" />
            <input
              type="search"
              aria-label="Search another symptom"
              placeholder="Search another symptom..."
              value={inlineSearchQuery}
              onChange={(e) => setInlineSearchQuery(e.target.value)}
              disabled={isSearchingNew}
            />
            <button type="submit" className="results-inline-search-btn" disabled={isSearchingNew || !inlineSearchQuery.trim()}>
              {isSearchingNew ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {searchError && (
          <div className="results-search-error-banner" role="alert">
            {searchError}
          </div>
        )}

        {/* Results Hero Overview Section */}
        <section className="results-hero-overview" aria-labelledby="results-title">
          <div className="results-hero-copy">
            <div className="guide-pill-badge">
              <Sparkles size={13} className="text-amber-600" />
              <span>Your Wellness Guide</span>
            </div>

            <h1 id="results-title" className="results-hero-heading">
              Caring for your health, naturally.
              <span className="results-sub-cue">
                A gentle guide for <em>{guide.query.toLowerCase()}.</em>
              </span>
            </h1>

            <div className="recommendations-target-row">
              <span className="rec-for-label">Here are personalized recommendations for</span>
              <span className="topic-tag-pill">
                <span className="topic-tag-icon">🔍</span>
                <span className="topic-tag-text">{guide.query}</span>
                <button
                  type="button"
                  className="topic-tag-clear"
                  onClick={() => navigate('/')}
                  aria-label="Search another topic"
                >
                  <X size={12} />
                </button>
              </span>
            </div>

            <div className="sample-stamp">
              <span />
              <span>{isSample ? 'SAMPLE GUIDE · NOT PERSONALIZED' : 'AI-GENERATED GUIDE · NOT PERSONALIZED'}</span>
            </div>
          </div>

          {/* Right Quote Box matching Mockup */}
          <aside className="quote-callout-card" aria-label="Wisdom Quote">
            <div className="quote-lotus-watermark" aria-hidden="true">🪷</div>
            <blockquote className="quote-text">
              “A healthy mind leads to a happy life.”
            </blockquote>
            <cite className="quote-author">— AAROGYAM AI</cite>
          </aside>
        </section>

        {/* Two Info Cards Side-by-Side: About + Safety Notice */}
        <div className="info-cards-row">
          {/* About Topic Card */}
          <article className="info-banner-card info-banner-card--about">
            <div className="info-card-header">
              <div className="info-icon-circle">
                <Info size={17} />
              </div>
              <h2 className="info-card-title">About {guide.query}</h2>
            </div>
            <p className="info-card-body">{guide.summary}</p>
          </article>

          {/* Safety Notice Card */}
          {!safetyNoticeDismissed && (
            <aside className="info-banner-card info-banner-card--safety" aria-label="Important safety information">
              <div className="info-card-header">
                <div className="safety-icon-circle">
                  <CircleAlert size={17} />
                </div>
                <h2 className="info-card-title">Safety Notice</h2>
                <button
                  type="button"
                  className="dismiss-safety-btn"
                  onClick={() => setSafetyNoticeDismissed(true)}
                  aria-label="Dismiss safety notice"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="info-card-body">{guide.safetyNote}</p>
            </aside>
          )}
        </div>

        {/* Tab Switcher & Saved Link */}
        <div className="results-controls-bar">
          <div className="guide-tabs" role="tablist" aria-label="Recommendation type">
            <button
              id="tab-remedies"
              type="button"
              role="tab"
              aria-selected={activeTab === 'remedies'}
              aria-controls="panel-remedies"
              className={`guide-tab ${activeTab === 'remedies' ? 'guide-tab--active' : ''}`}
              onClick={() => setActiveTab('remedies')}
            >
              <Leaf size={16} />
              <span>Home Remedies</span>
              <span className="tab-count-pill">{guide.remedies?.length || 0}</span>
            </button>
            <button
              id="tab-yoga"
              type="button"
              role="tab"
              aria-selected={activeTab === 'yoga'}
              aria-controls="panel-yoga"
              className={`guide-tab ${activeTab === 'yoga' ? 'guide-tab--active' : ''}`}
              onClick={() => setActiveTab('yoga')}
            >
              <span className="yoga-emoji">🧘</span>
              <span>Yoga Practices</span>
              <span className="tab-count-pill">{guide.yoga?.length || 0}</span>
            </button>
          </div>
        </div>

        {/* Main Guide Content */}
        <section className="guide-content" aria-label="Wellness recommendations">
          {activeTab === 'remedies' ? (
            <div id="panel-remedies" role="tabpanel" aria-labelledby="tab-remedies" className="guide-panel">
              <div className="guide-panel__heading">
                <div>
                  <span className="detail-label">GENTLE HOME SUPPORT</span>
                  <h2>Small comforts, at your pace.</h2>
                </div>
                <span className="panel-note">
                  <ShieldCheck size={16} /> No cure claims
                </span>
              </div>

              <RecommendationList
                items={guide.remedies}
                kind="remedy"
                query={guide.query}
                isSample={isSample}
                sampleVideos={guide.videos || []}
              />

              {/* Yoga preview shelf below remedies as featured in mockup */}
              {Boolean(guide.yoga?.length) && (
                <div className="yoga-preview-section">
                  <div className="yoga-preview-header">
                    <div>
                      <span className="detail-label">GENTLE MOVEMENT FOR {guide.query.toUpperCase()}</span>
                      <h3 className="yoga-section-heading">
                        <span className="yoga-lotus-icon">🧘</span>
                        <span>Yoga for {guide.query}</span>
                      </h3>
                      <p className="yoga-section-sub">Try these gentle yoga poses for relief.</p>
                    </div>
                    <button
                      type="button"
                      className="view-all-yoga-link"
                      onClick={() => setActiveTab('yoga')}
                    >
                      <span>View All Yoga</span>
                      <ArrowLeft size={14} className="rotate-180" />
                    </button>
                  </div>

                  <RecommendationList
                    items={guide.yoga.slice(0, 3)}
                    kind="yoga"
                    query={guide.query}
                  />
                </div>
              )}
            </div>
          ) : (
            <div id="panel-yoga" role="tabpanel" aria-labelledby="tab-yoga" className="guide-panel">
              <div className="guide-panel__heading">
                <div>
                  <span className="detail-label">SLOW, COMFORTABLE MOVEMENT</span>
                  <h2>Rest is a practice, too.</h2>
                </div>
                <span className="panel-note">
                  <Clock3 size={16} /> Keep it gentle
                </span>
              </div>

              <RecommendationList
                items={guide.yoga}
                kind="yoga"
                query={guide.query}
                mode="normal"
              />
            </div>
          )}
        </section>

        {/* Watch on YouTube keyword searches */}
        <section className="video-section" aria-labelledby="video-title">
          <div className="video-section__heading">
            <div>
              <span className="detail-label">A LITTLE INSPIRATION</span>
              <h2 id="video-title">Watch & unwind</h2>
            </div>
            <p>Choose a keyword card to search YouTube. Results are external and aren’t medical endorsements.</p>
          </div>

          <div className="video-grid">
            {youtubeSearches.map((video) => (
              <article className="video-card" key={video.title}>
                <a
                  className="video-art video-art--local"
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Search YouTube for ${video.title}`}
                >
                  <img src={video.thumbnail} alt={video.alt} loading="lazy" />
                  <span className="video-art__play">
                    <Play size={16} fill="currentColor" />
                  </span>
                  <span className="video-search-badge">Search YouTube</span>
                </a>
                <div className="video-card__body">
                  <span className="detail-label">YOUTUBE SEARCH</span>
                  <h3>
                    <a href={video.url} target="_blank" rel="noreferrer">
                      {video.title}
                    </a>
                  </h3>
                  <p>Open keyword search in a new tab</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="source-note">
          <div className="source-note__lead">
            <ShieldCheck size={16} />
            <strong>A gentle reminder:</strong>
          </div>
          <p>
            AAROGYAM AI provides lifestyle comfort suggestions and traditional Ayurvedic ideas. It does not provide medical diagnoses or prescriptions. If symptoms worsen, persist, or feel severe, please consult a qualified healthcare provider.
          </p>
        </footer>
      </main>

      <SiteFooter />
    </div>
  )
}
