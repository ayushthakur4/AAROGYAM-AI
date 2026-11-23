import { useState } from 'react'
import { ArrowLeft, ArrowRight, CircleAlert, Clock3, ExternalLink, Info, Leaf, Play, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
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

      {/* Dynamic Intelligence Notification Ribbon */}
      <div className="w-full bg-[#fff1e9] border-b border-[#d97706]/15 px-6 py-2.5">
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between text-[12.5px] text-[#6b6357]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#065f46] animate-pulse" />
            <span className="font-semibold text-[#1b3d2f]">Ayurvedic Sanctuary Intelligence:</span>
            <span>Compiled strictly from vetted Samhita texts &amp; Rasayana principles</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="text-[#d97706]">✦</span> Authentic Classical Ratio</span>
            <span className="opacity-40">|</span>
            <span className="flex items-center gap-1"><span className="text-[#065f46]">🌿</span> 100% Kitchen Apothecary</span>
          </div>
        </div>
      </div>

      <main className="results-page section-wrap max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
        {/* Top Back Link & In-Page Search */}
        <div className="results-top-nav-bar flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <Link className="back-link inline-flex items-center gap-2 text-[#55483a] hover:text-[#072316] font-semibold text-[14px] transition-colors group" to="/">
            <span className="w-8 h-8 rounded-full bg-[#ffffff] border border-[#d97706]/20 flex items-center justify-center group-hover:bg-[#1e392a] group-hover:text-white transition-all shadow-xs">
              <ArrowLeft size={16} />
            </span>
            <span>Return to Wellness Sanctuary</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form className="results-inline-search relative flex items-center bg-[#ffffff] rounded-full shadow-[0_6px_20px_rgba(180,83,9,0.06)] pl-4 pr-1.5 py-1.5 border border-[#d97706]/15 min-w-[300px] sm:min-w-[380px]" onSubmit={handleInlineSearch} role="search">
              <Search size={17} className="results-search-icon text-[#d97706] mr-2" />
              <input
                type="search"
                aria-label="Search another symptom"
                placeholder="Search another symptom..."
                value={inlineSearchQuery}
                onChange={(e) => setInlineSearchQuery(e.target.value)}
                disabled={isSearchingNew}
                className="w-full bg-transparent border-0 outline-none text-[14px] text-[#251910] placeholder:text-[#8c7e6d]"
              />
              <button
                type="submit"
                className="results-inline-search-btn w-9 h-9 rounded-full bg-[#1e392a] hover:bg-[#15291e] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-xs ml-2 shrink-0"
                disabled={isSearchingNew || !inlineSearchQuery.trim()}
                title="Search another symptom"
              >
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Active Query Pill */}
            <div className="inline-flex items-center gap-2 bg-[#f7efe2] px-3.5 py-2 rounded-full border border-[#d97706]/15 shadow-2xs">
              <span className="text-[12px] font-bold text-[#072316] flex items-center gap-1.5">
                <span className="text-[#d97706]">●</span> {guide.query}
              </span>
              <button
                type="button"
                className="text-[#8c7e6d] hover:text-[#ea580c] transition-colors"
                onClick={() => navigate('/')}
                aria-label="Search another topic"
                title="Clear active query"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        {searchError && (
          <div className="results-search-error-banner p-4 rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[13.5px] font-medium mb-6" role="alert">
            {searchError}
          </div>
        )}

        {/* Asymmetrical Results Hero: 7-Col Overview + 5-Col Samhita Wisdom */}
        <section className="results-hero-overview grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-10" aria-labelledby="results-title">
          {/* Left Column (7 cols): Diagnostic & Wellness Summary */}
          <div className="results-hero-copy lg:col-span-7 flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-[#ffffff] shadow-[0_6px_24px_rgba(180,83,9,0.05)] border border-[#d97706]/15 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#ffeadd] opacity-40 blur-3xl pointer-events-none" />

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="guide-pill-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7efe2] text-[#b45309] text-[11px] font-bold tracking-wider uppercase border border-[#d97706]/20">
                  <Sparkles size={13} className="text-[#d97706]" />
                  <span>Personalized Wellness Dossier</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#fbe4d5] text-[#663500] text-[10px] font-bold tracking-wider uppercase">
                  NON-DIAGNOSTIC GUIDE
                </span>
                <span className="text-[#8c7e6d] text-[12px]">
                  Updated moments ago
                </span>
              </div>

              <h1 id="results-title" className="results-hero-heading font-serif text-[32px] md:text-[38px] font-bold text-[#072316] tracking-tight mb-3 leading-tight">
                Caring for your health, naturally.
                <span className="results-sub-cue block text-[18px] md:text-[22px] font-normal italic text-[#904d00] mt-1">
                  Gentle guide for <em>{guide.query.toLowerCase()}.</em>
                </span>
              </h1>

              <p className="text-[15.5px] text-[#6b6357] leading-relaxed mb-6">
                {guide.summary}
              </p>

              <div className="recommendations-target-row flex flex-wrap items-center gap-2 text-[13px] text-[#6b6357]">
                <span className="rec-for-label">Here are personalized recommendations for</span>
                <span className="topic-tag-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#065f46] font-semibold text-[12px] border border-[#065f46]/20">
                  <span className="topic-tag-icon">🔍</span>
                  <span className="topic-tag-text">{guide.query}</span>
                  <button
                    type="button"
                    className="topic-tag-clear ml-1 text-[#065f46] hover:text-[#b91c1c] transition-colors"
                    onClick={() => navigate('/')}
                    aria-label="Search another topic"
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            </div>

            {/* Dosha Analysis Micro-Bar */}
            <div className="dosha-micro-bar mt-6 p-4 rounded-2xl bg-[#f7efe2]/70 border border-[#d97706]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] flex items-center justify-center text-lg shrink-0 shadow-xs">
                  🍃
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#072316] leading-tight">Vata-Kapha Pacification Focus</p>
                  <p className="text-[12px] text-[#6b6357] leading-tight mt-0.5">Targeting internal channel equilibrium and mucosal comfort</p>
                </div>
              </div>
              <div className="sample-stamp shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffffff] text-[#b45309] text-[11px] font-bold uppercase tracking-wider border border-[#d97706]/25 shadow-2xs whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" aria-hidden="true" />
                  {isSample ? 'SAMPLE GUIDE · NOT PERSONALIZED' : 'AI-GENERATED GUIDE · NOT PERSONALIZED'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sacred Samhita Canon Parchment Card */}
          <aside className="quote-callout-card lg:col-span-5 flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-[#fbf6ee] border border-[#d97706]/20 shadow-[0_6px_24px_rgba(180,83,9,0.04)] relative overflow-hidden" aria-label="Wisdom Quote">
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#d97706]/35 rounded-tl" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#d97706]/35 rounded-br" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-6">
                <span className="font-sans text-[11px] font-bold text-[#b45309] uppercase tracking-widest">
                  Sacred Sanskrit Canon
                </span>
                <span className="text-[#d97706] text-2xl font-serif opacity-75">ॐ</span>
              </div>

              <div className="my-auto py-2">
                <div className="quote-lotus-watermark w-14 h-14 rounded-full bg-[#ffeadd]/70 text-[#904d00] flex items-center justify-center text-2xl mb-4 shadow-inner" aria-hidden="true">
                  🪷
                </div>
                <blockquote className="quote-text font-serif italic text-[19px] md:text-[20px] text-[#15291e] leading-snug mb-4">
                  “A healthy mind leads to a happy life. Where sweet moisture and steady breath touch the living vessel, natural vitality returns without haste.”
                </blockquote>
                <cite className="quote-author font-sans text-[12px] font-bold text-[#b45309] not-italic block uppercase tracking-wide">
                  — Charaka Samhita, Chikitsa Sthanam
                </cite>
              </div>

              <div className="pt-6 border-t border-[#d97706]/15 flex items-center justify-between text-[#8c7e6d] text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="text-[#d97706]">☀️</span> Ideal Hour: Dawn or Dusk
                </span>
                <span className="font-bold tracking-wider text-[#55483a] uppercase text-[10px]">
                  Ayurvedic Rasayana
                </span>
              </div>
            </div>
          </aside>
        </section>

        {/* Two Info Cards Side-by-Side: About + Safety Notice */}
        <div className="info-cards-row grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* About Topic Card */}
          <article className="info-banner-card info-banner-card--about p-6 rounded-2xl bg-[#ffffff] border border-[#d97706]/15 shadow-sm flex items-start gap-4">
            <div className="info-icon-circle w-10 h-10 rounded-full bg-[#ecfdf5] text-[#065f46] shrink-0 flex items-center justify-center mt-0.5">
              <Info size={19} />
            </div>
            <div className="flex flex-col">
              <h2 className="info-card-title font-serif text-[18px] font-bold text-[#072316] mb-1.5">
                About {guide.query}
              </h2>
              <p className="info-card-body text-[14px] text-[#6b6357] leading-relaxed">
                {guide.summary}
              </p>
            </div>
          </article>

          {/* Safety Notice Card */}
          {!safetyNoticeDismissed && (
            <aside className="info-banner-card info-banner-card--safety p-6 rounded-2xl bg-[#fff9f0] border border-[#fde68a] shadow-sm flex items-start justify-between gap-4" aria-label="Important safety information">
              <div className="flex items-start gap-4">
                <div className="safety-icon-circle w-10 h-10 rounded-full bg-[#ffffff] text-[#ea580c] shrink-0 flex items-center justify-center mt-0.5 shadow-xs">
                  <CircleAlert size={19} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="info-card-title font-serif text-[18px] font-bold text-[#251910]">
                      Safety Notice
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#ea580c] text-white text-[10px] font-bold uppercase tracking-wider">
                      Non-Diagnostic
                    </span>
                  </div>
                  <p className="info-card-body text-[14px] text-[#6b6357] leading-relaxed">
                    {guide.safetyNote}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="dismiss-safety-btn text-[#8c7e6d] hover:text-[#251910] p-1.5 rounded-lg hover:bg-black/5 transition-colors shrink-0"
                onClick={() => setSafetyNoticeDismissed(true)}
                aria-label="Dismiss safety notice"
              >
                <X size={16} />
              </button>
            </aside>
          )}
        </div>

        {/* Dual Healing Pillars Tab Switcher */}
        <div className="results-controls-bar flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4 border-t border-[#d97706]/15">
          <div>
            <span className="font-sans text-[11px] font-bold text-[#b45309] uppercase tracking-wider block mb-1">
              Dual Healing Pillars
            </span>
            <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#072316]">
              Restorative Remedies &amp; Movement
            </h2>
          </div>

          <div className="guide-tabs inline-flex p-1.5 rounded-full bg-[#fbe4d5]/70 border border-[#d97706]/20 shadow-inner" role="tablist" aria-label="Recommendation type">
            <button
              id="tab-remedies"
              type="button"
              role="tab"
              aria-selected={activeTab === 'remedies'}
              aria-controls="panel-remedies"
              className={`guide-tab flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-[13.5px] transition-all ${
                activeTab === 'remedies'
                  ? 'bg-[#1e392a] text-white shadow-sm'
                  : 'text-[#6b6357] hover:text-[#072316]'
              }`}
              onClick={() => setActiveTab('remedies')}
            >
              <Leaf size={16} className={activeTab === 'remedies' ? 'text-[#f59e0b]' : ''} />
              <span>Home Remedies</span>
              <span className={`tab-count-pill w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                activeTab === 'remedies' ? 'bg-white/20 text-white' : 'bg-[#f7efe2] text-[#6b6357]'
              }`}>
                {guide.remedies?.length || 0}
              </span>
            </button>

            <button
              id="tab-yoga"
              type="button"
              role="tab"
              aria-selected={activeTab === 'yoga'}
              aria-controls="panel-yoga"
              className={`guide-tab flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-[13.5px] transition-all ${
                activeTab === 'yoga'
                  ? 'bg-[#1e392a] text-white shadow-sm'
                  : 'text-[#6b6357] hover:text-[#072316]'
              }`}
              onClick={() => setActiveTab('yoga')}
            >
              <span className="yoga-emoji">🧘</span>
              <span>Yoga Practices</span>
              <span className={`tab-count-pill w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                activeTab === 'yoga' ? 'bg-white/20 text-white' : 'bg-[#f7efe2] text-[#6b6357]'
              }`}>
                {guide.yoga?.length || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Main Guide Content */}
        <section className="guide-content" aria-label="Wellness recommendations">
          {activeTab === 'remedies' ? (
            <div id="panel-remedies" role="tabpanel" aria-labelledby="tab-remedies" className="guide-panel">
              <div className="guide-panel__heading flex items-center justify-between pb-6 mb-6 border-b border-[#d97706]/10">
                <div>
                  <span className="detail-label text-[11px] font-bold text-[#b45309] uppercase tracking-wider block mb-1">
                    GENTLE HOME SUPPORT
                  </span>
                  <h2 className="font-serif text-[26px] font-bold text-[#072316]">
                    Small comforts, at your pace.
                  </h2>
                </div>
                <span className="panel-note inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#065f46] text-[12px] font-semibold">
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

              {/* Yoga preview shelf below remedies matching Stitch design */}
              {Boolean(guide.yoga?.length) && (
                <div className="yoga-preview-section mt-12 p-8 rounded-3xl bg-[#f7efe2]/80 border border-[#d97706]/15 shadow-sm">
                  <div className="yoga-preview-header flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="detail-label text-[11px] font-bold text-[#b45309] uppercase tracking-wider block mb-1">
                        GENTLE MOVEMENT FOR {guide.query.toUpperCase()}
                      </span>
                      <h3 className="yoga-section-heading font-serif text-[24px] font-bold text-[#072316] flex items-center gap-2">
                        <span className="yoga-lotus-icon">🧘</span>
                        <span>Yoga for {guide.query}</span>
                      </h3>
                      <p className="yoga-section-sub text-[13.5px] text-[#6b6357]">
                        Try these gentle restorative postures to relieve tension and deepen natural breath.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="view-all-yoga-link inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1e392a] text-white text-[13px] font-semibold hover:bg-[#15291e] transition-all shadow-xs"
                      onClick={() => setActiveTab('yoga')}
                    >
                      <span>View All Yoga</span>
                      <ArrowRight size={14} />
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
              <div className="guide-panel__heading flex items-center justify-between pb-6 mb-6 border-b border-[#d97706]/10">
                <div>
                  <span className="detail-label text-[11px] font-bold text-[#b45309] uppercase tracking-wider block mb-1">
                    SLOW, COMFORTABLE MOVEMENT
                  </span>
                  <h2 className="font-serif text-[26px] font-bold text-[#072316]">
                    Rest is a practice, too.
                  </h2>
                </div>
                <span className="panel-note inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-[12px] font-semibold">
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

        {/* Watch & Unwind: Curated YouTube Inspiration Shelf */}
        <section className="video-section mt-14 pt-10 border-t border-[#d97706]/15" aria-labelledby="video-title">
          <div className="video-section__heading mb-8">
            <span className="detail-label text-[11px] font-bold text-[#b45309] uppercase tracking-wider block mb-1">
              A LITTLE INSPIRATION
            </span>
            <h2 id="video-title" className="font-serif text-[28px] font-bold text-[#072316] mb-2">
              Watch &amp; unwind
            </h2>
            <p className="text-[14px] text-[#6b6357]">
              Choose a keyword card to search YouTube. Results are external and aren’t medical endorsements.
            </p>
          </div>

          <div className="video-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {youtubeSearches.map((video) => (
              <article className="video-card group rounded-3xl bg-[#ffffff] border border-[#d97706]/15 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between" key={video.title}>
                <a
                  className="video-art video-art--local relative h-48 w-full bg-[#f7efe2] flex items-center justify-center overflow-hidden block"
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Search YouTube for ${video.title}`}
                >
                  <img src={video.thumbnail} alt={video.alt} loading="lazy" className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                  <span className="video-art__play absolute w-12 h-12 rounded-full bg-[#15291e]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={18} fill="currentColor" className="text-[#f59e0b] ml-0.5" />
                  </span>
                  <span className="video-search-badge absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#ffffff]/90 text-[#072316] text-[11px] font-bold shadow-xs">
                    Search YouTube
                  </span>
                </a>
                <div className="video-card__body p-6">
                  <span className="detail-label text-[10px] font-bold text-[#b45309] uppercase tracking-wider block mb-1">
                    YOUTUBE SEARCH
                  </span>
                  <h3 className="font-serif text-[18px] font-bold text-[#072316] group-hover:text-[#904d00] transition-colors mb-2">
                    <a href={video.url} target="_blank" rel="noreferrer">
                      {video.title}
                    </a>
                  </h3>
                  <p className="text-[12.5px] text-[#6b6357] flex items-center gap-1">
                    <span>Open keyword search in a new tab</span>
                    <ExternalLink size={12} />
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Source Reminder Footer Banner */}
        <footer className="source-note mt-12 p-6 rounded-3xl bg-[#f7efe2]/60 border border-[#d97706]/15 flex items-start gap-3.5">
          <div className="source-note__lead text-[#065f46] shrink-0 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div className="text-[13px] text-[#6b6357] leading-relaxed">
            <strong className="text-[#072316] font-bold">A gentle reminder: </strong>
            AAROGYAM AI provides lifestyle comfort suggestions and traditional Ayurvedic ideas. It does not provide medical diagnoses or prescriptions. If symptoms worsen, persist, or feel severe, please consult a qualified healthcare provider.
          </div>
        </footer>
      </main>

      <SiteFooter />
    </div>
  )
}
