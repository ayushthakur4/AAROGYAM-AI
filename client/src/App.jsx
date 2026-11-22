import { ArrowRight, Brain, Heart, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSection from './components/HeroSection.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'

const howItWorksSteps = [
  {
    step: '1. Search',
    title: '1. Search',
    subtitle: 'Enter your health concern',
    icon: Search,
    colorClass: 'step-icon--green',
  },
  {
    step: '2. Discover',
    title: '2. Discover',
    subtitle: 'Get AI-powered remedies & yoga',
    icon: Brain,
    colorClass: 'step-icon--purple',
  },
  {
    step: '3. Heal',
    title: '3. Heal',
    subtitle: 'Follow the natural path to wellness',
    icon: Heart,
    colorClass: 'step-icon--peach',
  },
]

const categories = [
  {
    title: 'Ayurveda',
    subtitle: 'Natural Healing',
    icon: '🥣',
    bgClass: 'cat-circle--green',
  },
  {
    title: 'Yoga',
    subtitle: 'Mind & Body',
    icon: '🧘',
    bgClass: 'cat-circle--peach',
  },
  {
    title: 'Home Remedies',
    subtitle: 'Simple & Effective',
    icon: '🌿',
    bgClass: 'cat-circle--amber',
  },
  {
    title: 'Healthy Living',
    subtitle: 'Live Better',
    icon: '💚',
    bgClass: 'cat-circle--emerald',
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
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
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
        <section className="how-works-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-wrap">
            <div className="ornate-section-header">
              <span className="ornament-swag ornament-swag--left">~ • ~</span>
              <h2 id="how-title" className="ornate-title">How AAROGYAM AI Works?</h2>
              <span className="ornament-swag ornament-swag--right">~ • ~</span>
            </div>

            <div className="steps-flow">
              {howItWorksSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.step} className="step-flow-item-wrap">
                    <div className="step-bubble-card">
                      <div className={`step-bubble-icon ${item.colorClass}`}>
                        <Icon size={26} strokeWidth={1.8} />
                      </div>
                      <h3 className="step-bubble-title">{item.title}</h3>
                      <p className="step-bubble-sub">{item.subtitle}</p>
                    </div>
                    {index < howItWorksSteps.length - 1 && (
                      <div className="step-arrow" aria-hidden="true">
                        <ArrowRight size={22} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Wellness Categories Section */}
        <section className="wellness-categories-section" id="wellness" aria-labelledby="wellness-title">
          <div className="section-wrap">
            <div className="ornate-section-header">
              <span className="leaf-flourish">🌿</span>
              <h2 id="wellness-title" className="ornate-title">Wellness Categories</h2>
              <span className="leaf-flourish">🌿</span>
            </div>

            <h3 className="categories-subhead">
              A little care, <em>in many forms.</em>
            </h3>

            <div className="categories-pills-grid">
              {categories.map((cat) => (
                <article key={cat.title} className="category-pill-card">
                  <div className={`category-icon-orb ${cat.bgClass}`}>
                    <span className="category-emoji">{cat.icon}</span>
                  </div>
                  <div className="category-text">
                    <h4 className="category-name">{cat.title}</h4>
                    <p className="category-tagline">{cat.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy / About Section */}
        <section className="philosophy-section" id="about" aria-labelledby="about-title">
          <div className="section-wrap philosophy-card">
            <div className="philosophy-content">
              <span className="philosophy-eyebrow">OUR PHILOSOPHY</span>
              <h2 id="about-title" className="philosophy-title">
                Ancient roots.<br />
                <em>A more mindful today.</em>
              </h2>
              <p className="philosophy-copy">
                AAROGYAM AI brings traditional wellness perspectives and modern technology together with care.
                It’s a place to explore supportive comfort ideas inspired by timeless Ayurvedic wisdom — not to
                diagnose or replace professional medical advice.
              </p>
              <div className="philosophy-sanskrit" lang="sa">
                स्वस्थस्य स्वास्थ्य रक्षणम्
              </div>
              <p className="philosophy-sanskrit-trans">
                “Protecting and nurturing the health of the healthy.”
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
