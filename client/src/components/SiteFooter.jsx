import { Heart, Leaf, Sparkles } from 'lucide-react'
import LotusLogo from './LotusLogo.jsx'

export default function SiteFooter() {
  return (
    <footer className="aarogyam-footer">
      <div className="section-wrap footer-inner">
        <div className="footer-top-row">
          <div className="footer-brand">
            <LotusLogo size={42} />
          </div>

          <div className="footer-feature-badges">
            <div className="feature-badge">
              <span className="badge-icon">🌿</span>
              <span>Natural Remedies</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">🧘</span>
              <span>Yoga for Wellness</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">💚</span>
              <span>Healthy Living</span>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom-row">
          <p className="footer-disclaimer">
            AAROGYAM AI provides educational wellness guidance and does not offer medical diagnoses or prescriptions.
            Always seek advice from a licensed medical practitioner for health concerns.
          </p>
          <div className="footer-links">
            <a href="/#about" className="footer-link">About</a>
            <a href="/#wellness" className="footer-link">Wellness Library</a>
            <span className="footer-copyright">© {new Date().getFullYear()} AAROGYAM AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
