import { ArrowRight, ArrowUpRight, Brain, Heart, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSection from './components/HeroSection.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import { getApiBaseUrl } from './utils/api.js'

const howItWorksSteps = [
  {
    stepNum: '1',
    stepLabel: 'Step One',
    title: '1. Search',
    headline: 'Enter Your Concern',
    subtitle: 'Express your symptoms, physical stiffness, mental fatigue, or balance needs in plain, human language.',
    tag: 'Natural language query intake',
    icon: Search,
    colorClass: 'step-icon--green',
  },
  {
    stepNum: '2',
    stepLabel: 'Step Two',
    title: '2. Discover',
    headline: 'AI & Vedic Synthesis',
    subtitle: 'Our algorithmic engine references time-honored Ayurvedic principles, dosha considerations, and yogic science.',
    tag: 'Holistic herbal & asana mapping',
    icon: Brain,
    colorClass: 'step-icon--purple',
  },
  {
    stepNum: '3',
    stepLabel: 'Step Three',
    title: '3. Heal',
    headline: 'Natural Restoration',
    subtitle: 'Embrace gentle home decoctions, posture guides, and mindful daily rituals that restore natural equilibrium.',
    tag: 'Daily mindful living practices',
    icon: Heart,
    colorClass: 'step-icon--peach',
  },
]

const categories = [
  {
    eyebrow: 'Traditional Science',
    title: 'Ayurveda',
    subtitle: 'Natural Healing',
    description: 'Dosha alignment, herbal churnas, and foundational dietary harmony for longevity.',
    cta: 'Explore remedies',
    icon: '🥣',
    bgClass: 'cat-circle--green',
    accentBorder: '#1b3d2f',
  },
  {
    eyebrow: 'Conscious Movement',
    title: 'Yoga',
    subtitle: 'Mind & Body',
    description: 'Therapeutic asanas and breathwork (pranayama) curated for gentle physiological release.',
    cta: 'Explore asanas',
    icon: '🧘',
    bgClass: 'cat-circle--peach',
    accentBorder: '#f4a261',
  },
  {
    eyebrow: 'Kitchen Apothecary',
    title: 'Home Remedies',
    subtitle: 'Simple & Effective',
    description: 'Kadhas, herbal infusions, and time-tested pantry staples for seasonal ease.',
    cta: 'Explore recipes',
    icon: '🌿',
    bgClass: 'cat-circle--amber',
    accentBorder: '#f59e0b',
  },
  {
    eyebrow: 'Daily Dinacharya',
    title: 'Healthy Living',
    subtitle: 'Live Better',
    description: 'Circadian routines, restorative rest, water therapies, and seasonal self-care.',
    cta: 'Explore habits',
    icon: '💚',
    bgClass: 'cat-circle--emerald',
    accentBorder: '#065f46',
  },
]

export default function App() {
  const navigate = useNavigate()
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  async function searchWellness(query) {
    setIsSearching(true)
    setSearchError('')
    try {
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(75_000),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'We could not prepare a guide right now. Please try again shortly.')
      navigate('/results', { state: { guide: payload } })
    } catch (error) {
      setSearchError(error.name === 'TimeoutError'
        ? 'This is taking longer than expected. Please try again.'
        : error.message === 'Failed to fetch'
          ? 'The wellness service is not reachable. Check that the server is running and try again.'
          : error.message || 'We could not prepare a guide right now. Please try again shortly.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div id="top" className="app-shell ayur-theme">
      <SiteHeader />

      <main>
        <HeroSection onSearch={searchWellness} isSearching={isSearching} searchError={searchError} />

        {/* How AAROGYAM AI Works? Section */}
        <section className="how-works-section relative" id="how-it-works" aria-labelledby="how-title">
          <div className="section-wrap">
            <div className="ornate-section-header">
              <div className="inline-flex items-center gap-2 text-[#d97706] mb-2">
                <span>~</span>
                <span className="text-xs">✦</span>
                <span className="text-lg">🪷</span>
                <span className="text-xs">✦</span>
                <span>~</span>
              </div>
              <h2 id="how-title" className="ornate-title font-serif text-[32px] md:text-[42px] font-bold text-[#072316]">
                How AAROGYAM AI Works?
              </h2>
              <p className="text-[15px] text-[#6b6357] max-w-xl mx-auto mt-2 leading-relaxed">
                A seamless bridge connecting classical therapeutic manuscripts with compassionate intelligence.
              </p>
            </div>

            <div className="steps-flow relative">
              {howItWorksSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.stepLabel} className="step-flow-item-wrap">
                    <div className="step-bubble-card group">
                      <div className="relative mb-5">
                        <div className={`step-bubble-icon ${item.colorClass}`}>
                          <Icon size={28} strokeWidth={1.8} />
                        </div>
                        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#072316] text-[#ffffff] text-xs font-bold flex items-center justify-center shadow-xs">
                          {item.stepNum}
                        </span>
                      </div>
                      <span className="font-sans text-[11px] font-bold text-[#d97706] tracking-[0.15em] uppercase mb-1 block">
                        {item.stepLabel}
                      </span>
                      <h3 className="step-bubble-title font-serif text-[19px] font-bold text-[#072316] mb-2">
                        {item.title}
                      </h3>
                      <p className="step-bubble-sub text-[13.5px] text-[#6b6357] leading-relaxed">
                        {item.subtitle}
                      </p>
                      <div className="mt-4 pt-3 border-t border-[#d97706]/10 text-[11px] font-semibold text-[#065f46]">
                        {item.tag}
                      </div>
                    </div>
                    {index < howItWorksSteps.length - 1 && (
                      <div className="step-arrow" aria-hidden="true">
                        <ArrowRight size={22} className="text-[#d97706]/60" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Wellness Categories Section */}
        <section className="wellness-categories-section relative" id="wellness" aria-labelledby="wellness-title">
          <div className="section-wrap">
            <div className="ornate-section-header">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-[11px] font-bold tracking-widest uppercase mb-3 shadow-xs">
                <span>🌿</span>
                <span>Pillars of Balance</span>
                <span>🌿</span>
              </div>
              <h2 id="wellness-title" className="ornate-title font-serif text-[32px] md:text-[42px] font-bold text-[#072316]">
                Wellness Categories
              </h2>
              <h3 className="categories-subhead text-[16px] text-[#6b6357] mt-2">
                A little care, <em>in many forms.</em>
              </h3>
            </div>

            <div className="categories-pills-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              {categories.map((cat) => (
                <article
                  key={cat.title}
                  className="category-pill-card group relative rounded-3xl p-8 bg-[#ffffff] shadow-[0_8px_24px_rgba(21,41,30,0.05)] hover:shadow-[0_16px_36px_rgba(21,41,30,0.12)] transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden border border-[#d97706]/15"
                >
                  <div
                    className="absolute top-0 inset-x-0 h-1.5"
                    style={{ backgroundColor: cat.accentBorder }}
                  />
                  <div className={`category-icon-orb w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-5 shadow-inner ${cat.bgClass}`}>
                    <span className="category-emoji">{cat.icon}</span>
                  </div>
                  <div className="category-text flex flex-col items-center w-full">
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#8c7e6d] mb-1">
                      {cat.eyebrow}
                    </span>
                    <h4 className="category-name font-serif text-[22px] font-bold text-[#072316] mb-1">
                      {cat.title}
                    </h4>
                    <p className="category-tagline text-[13px] font-semibold text-[#b45309] mb-3">
                      {cat.subtitle}
                    </p>
                    <p className="text-[13px] text-[#6b6357] leading-relaxed mb-6">
                      {cat.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => searchWellness(cat.title)}
                      className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1e392a] hover:text-[#b45309] transition-colors"
                    >
                      <span>{cat.cta}</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy / About Section */}
        <section className="philosophy-section relative" id="about" aria-labelledby="about-title">
          <div className="section-wrap philosophy-card relative rounded-3xl bg-[#f7efe2]/80 shadow-[0_12px_40px_rgba(21,41,30,0.06)] p-8 md:p-14 lg:p-16 overflow-hidden border border-[#d97706]/15">
            {/* Ambient Lighting Background Accents */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#f59e0b]/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-[#ecfdf5] blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Editorial Manifesto */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <span className="font-sans text-[11px] font-bold text-[#b45309] tracking-[0.2em] uppercase mb-3 block">
                  OUR PHILOSOPHY
                </span>
                <h2 id="about-title" className="philosophy-title font-serif text-[32px] md:text-[42px] font-bold text-[#072316] tracking-tight mb-5 leading-tight">
                  Ancient roots.<br />
                  <span className="italic font-normal text-[#904d00]">A more mindful today.</span>
                </h2>
                <p className="philosophy-copy text-[15px] text-[#6b6357] leading-relaxed mb-4">
                  In an accelerated world governed by synthetic urgency, AAROGYAM AI looks backward to look forward. We believe genuine wellness is not a reaction to crisis, but a sustained, loving conversation with one’s own constitution.
                </p>
                <p className="text-[14px] text-[#6b6357] leading-relaxed mb-8">
                  Our traditional herbal formulations, teas, decoctions, and postures serve as gentle daily balms and restorative comforts. We deliberately reject clinical sterility in favor of mindful living traditions preserved over millennia in the sacred texts of Charaka and Sushruta.
                </p>

                {/* 3 Values Cluster */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-2">
                  <div className="p-4 rounded-2xl bg-[#ffffff]/80 shadow-xs border border-[#d97706]/10">
                    <span className="font-serif text-[20px] font-bold text-[#b45309] block mb-1">01</span>
                    <h4 className="font-serif font-bold text-[#072316] text-[15px] mb-1">Dosha Balance</h4>
                    <p className="text-[12px] text-[#6b6357]">Honoring unique constitutional temperaments.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#ffffff]/80 shadow-xs border border-[#d97706]/10">
                    <span className="font-serif text-[20px] font-bold text-[#065f46] block mb-1">02</span>
                    <h4 className="font-serif font-bold text-[#072316] text-[15px] mb-1">Purity of Origin</h4>
                    <p className="text-[12px] text-[#6b6357]">Pure botanical remedies rooted in classical herbs.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#ffffff]/80 shadow-xs border border-[#d97706]/10">
                    <span className="font-serif text-[20px] font-bold text-[#904d00] block mb-1">03</span>
                    <h4 className="font-serif font-bold text-[#072316] text-[15px] mb-1">Mindful AI</h4>
                    <p className="text-[12px] text-[#6b6357]">Intelligent, respectful contextual synthesis.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Sacred Sanskrit Inscription Card */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="relative p-8 md:p-10 rounded-2xl bg-[#ffffff] shadow-[0_8px_30px_rgba(180,83,9,0.08)] flex flex-col items-center text-center border border-[#d97706]/15">
                  <div className="w-14 h-14 rounded-full bg-[#ecfdf5] text-[#065f46] flex items-center justify-center mb-5 shadow-inner">
                    <span className="text-2xl">🪷</span>
                  </div>

                  <div className="philosophy-sanskrit font-serif text-[26px] md:text-[28px] font-bold text-[#072316] tracking-wide mb-3" lang="sa">
                    स्वस्थस्य स्वास्थ्य रक्षणम्
                  </div>
                  <div className="w-12 h-0.5 bg-[#f59e0b]/50 mb-4" />

                  <p className="philosophy-sanskrit-trans font-serif italic text-[18px] text-[#55483a] leading-relaxed mb-3">
                    “Protecting and nurturing the health of the healthy.”
                  </p>
                  <cite className="font-sans text-[11px] font-bold text-[#b45309] uppercase tracking-widest not-italic block mb-6">
                    — Charaka Samhita (Sutra Sthana 30.26)
                  </cite>

                  <div className="w-full text-left bg-[#f7efe2]/60 p-3.5 rounded-xl border border-[#d97706]/10 flex items-start gap-2.5">
                    <Sparkles size={16} className="text-[#065f46] shrink-0 mt-0.5" />
                    <p className="text-[12px] text-[#6b6357] leading-relaxed">
                      Complementary holistic advice designed for peaceful self-care, mindfulness, and wholesome balance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
