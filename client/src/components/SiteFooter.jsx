import LotusLogo from './LotusLogo.jsx'

export default function SiteFooter() {
  return (
    <footer className="aarogyam-footer bg-[#fff1e9]/60 border-t border-[#d97706]/15 mt-16 py-12">
      <div className="section-wrap max-w-[1200px] mx-auto px-6 lg:px-8 footer-inner">
        <div className="footer-top-row flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#d97706]/10">
          <div className="footer-brand flex items-center">
            <LotusLogo size={42} />
          </div>

          <div className="footer-feature-badges flex flex-wrap items-center justify-center gap-3">
            <div className="feature-badge inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-[12px] font-semibold shadow-2xs border border-[#065f46]/10">
              <span className="badge-icon">🌿</span>
              <span>Natural Remedies</span>
            </div>
            <div className="feature-badge inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f7efe2] text-[#b45309] text-[12px] font-semibold shadow-2xs border border-[#d97706]/15">
              <span className="badge-icon">🧘</span>
              <span>Yoga for Wellness</span>
            </div>
            <div className="feature-badge inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ffeadd] text-[#663500] text-[12px] font-semibold shadow-2xs border border-[#fe932c]/15">
              <span className="badge-icon">💚</span>
              <span>Healthy Living</span>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Alert Box */}
        <div className="w-full max-w-3xl mx-auto my-8 p-4 rounded-2xl bg-[#fff9f0] border border-[#fde68a] text-center shadow-xs">
          <p className="footer-disclaimer text-[12.5px] text-[#6b6357] leading-relaxed">
            <strong className="text-[#ea580c] font-bold">Medical Disclaimer: </strong>
            AAROGYAM AI provides educational wellness guidance and does not offer medical diagnoses or prescriptions.
            Always seek advice from a licensed medical practitioner for health concerns.
          </p>
        </div>

        <div className="footer-bottom-row pt-4 flex flex-col sm:flex-row items-center justify-between text-[#8c7e6d] text-[12.5px] gap-4">
          <span className="footer-copyright">
            © {new Date().getFullYear()} AAROGYAM AI. All sacred rights reserved.
          </span>
          <div className="footer-links flex flex-wrap items-center justify-center gap-6">
            <a href="/#about" className="footer-link hover:text-[#072316] transition-colors">About</a>
            <a href="/#wellness" className="footer-link hover:text-[#072316] transition-colors">Wellness Library</a>
            <a href="/#about" className="footer-link hover:text-[#072316] transition-colors">Privacy Sanctuary</a>
            <a href="/#about" className="footer-link hover:text-[#072316] transition-colors">Terms of Guidance</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
