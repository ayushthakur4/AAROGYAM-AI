import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Compass, Heart, Leaf, Sparkles, Wind } from 'lucide-react'
import App from './App.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AuthModal from './components/AuthModal.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function NotFoundPage() {
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState('Inhale')
  const [breathCount, setBreathCount] = useState(4)

  useEffect(() => {
    if (!isBreathing) return
    let phase = 'Inhale'
    let count = 4
    setBreathPhase(phase)
    setBreathCount(count)

    const interval = setInterval(() => {
      count -= 1
      if (count <= 0) {
        if (phase === 'Inhale') {
          phase = 'Hold'
          count = 7
        } else if (phase === 'Hold') {
          phase = 'Exhale'
          count = 8
        } else {
          phase = 'Inhale'
          count = 4
        }
        setBreathPhase(phase)
      }
      setBreathCount(count)
    }, 1000)

    return () => clearInterval(interval)
  }, [isBreathing])

  return (
    <div className="app-shell ayur-theme min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="not-found-page flex-1 flex flex-col items-center justify-center text-center px-6 py-16 relative overflow-hidden">
        {/* Subtle Watermark 404 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none" aria-hidden="true">
          <span className="font-serif text-[280px] font-black text-[#072316]">404</span>
        </div>

        {/* Ambient Halo */}
        <div className="absolute w-96 h-96 rounded-full bg-[#f59e0b]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          {/* Zen Cairn / Lotus Emblem */}
          <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] flex items-center justify-center text-3xl mb-6 shadow-sm">
            🪷
          </div>

          <span className="eyebrow inline-flex items-center gap-2 text-[11px] font-bold text-[#b45309] uppercase tracking-[0.2em] mb-2">
            <span className="eyebrow__line inline-block w-4 h-px bg-[#b45309]" />
            AAROGYAM AI
          </span>

          <h1 className="font-serif text-[36px] md:text-[46px] font-bold text-[#072316] tracking-tight mb-3">
            That path isn’t here.
          </h1>

          <p className="text-[16px] text-[#6b6357] leading-relaxed mb-8 max-w-md">
            Let’s return to a quieter starting point. Pause, realign, and take a conscious breath before continuing your journey.
          </p>

          {/* Interactive 4-7-8 Breath Pacer Widget */}
          <div className="w-full p-6 rounded-3xl bg-[#ffffff] border border-[#d97706]/15 shadow-[0_8px_24px_rgba(21,41,30,0.04)] mb-8 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-[11px] font-bold text-[#065f46] uppercase tracking-wider flex items-center gap-1.5">
                <Wind size={14} /> 4-7-8 Breath Pacer
              </span>
              <button
                type="button"
                onClick={() => setIsBreathing(!isBreathing)}
                className="text-[12px] font-semibold text-[#1e392a] hover:text-[#b45309] transition-colors"
              >
                {isBreathing ? 'Pause Breathing' : 'Start 1-Min Pause'}
              </button>
            </div>

            <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
              isBreathing && breathPhase === 'Inhale'
                ? 'bg-[#ecfdf5] scale-110 shadow-[0_0_24px_rgba(6,95,70,0.2)]'
                : isBreathing && breathPhase === 'Hold'
                ? 'bg-[#fef3c7] scale-110 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                : isBreathing && breathPhase === 'Exhale'
                ? 'bg-[#fff1e9] scale-95'
                : 'bg-[#f7efe2]'
            }`}>
              <span className="font-serif text-[15px] font-bold text-[#072316]">{isBreathing ? breathPhase : 'Breathe'}</span>
              {isBreathing && <span className="text-[18px] font-mono font-bold text-[#b45309]">{breathCount}s</span>}
            </div>

            <p className="text-[12px] text-[#8c7e6d] mt-3">
              {isBreathing ? 'Follow the cadence to ease tension' : 'Inhale 4s · Hold 7s · Exhale 8s'}
            </p>
          </div>

          {/* 3 Re-centering Pathways */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8">
            <Link
              to="/#wellness"
              className="p-3.5 rounded-2xl bg-[#f7efe2]/70 hover:bg-[#f7efe2] border border-[#d97706]/10 text-left transition-all hover:-translate-y-0.5"
            >
              <span className="text-lg block mb-1">🌿</span>
              <h4 className="text-[13px] font-bold text-[#072316]">Remedies</h4>
              <p className="text-[11px] text-[#6b6357]">Herbal decoctions &amp; teas</p>
            </Link>

            <Link
              to="/results/demo"
              className="p-3.5 rounded-2xl bg-[#f7efe2]/70 hover:bg-[#f7efe2] border border-[#d97706]/10 text-left transition-all hover:-translate-y-0.5"
            >
              <span className="text-lg block mb-1">🧘</span>
              <h4 className="text-[13px] font-bold text-[#072316]">Yoga Guide</h4>
              <p className="text-[11px] text-[#6b6357]">Restorative poses</p>
            </Link>

            <Link
              to="/"
              className="p-3.5 rounded-2xl bg-[#f7efe2]/70 hover:bg-[#f7efe2] border border-[#d97706]/10 text-left transition-all hover:-translate-y-0.5"
            >
              <span className="text-lg block mb-1">🔍</span>
              <h4 className="text-[13px] font-bold text-[#072316]">Sanctuary Search</h4>
              <p className="text-[11px] text-[#6b6357]">Explore concerns</p>
            </Link>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1e392a] text-[#ffffff] font-semibold text-[14px] hover:bg-[#15291e] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <AuthModal />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/results/demo" element={<ResultsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
