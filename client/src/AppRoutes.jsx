import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import App from './App.jsx'
import ResultsPage from './pages/ResultsPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <span className="eyebrow"><span className="eyebrow__line" /> AAROGYAM AI</span>
      <h1>That path isn’t here.</h1>
      <p>Let’s return to a quieter starting point.</p>
      <Link to="/"><ArrowLeft size={15} /> Back to home</Link>
    </main>
  )
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/results/demo" element={<ResultsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
