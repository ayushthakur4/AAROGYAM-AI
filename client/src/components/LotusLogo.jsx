export default function LotusLogo({ size = 38, showSubtitle = true, className = '' }) {
  return (
    <div className={`brand-lockup ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="lotus-icon"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lotusGold" x1="8" y1="52" x2="56" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="0.5" stopColor="#D97706" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="lotusGlow" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" stopOpacity="0.8" />
            <stop offset="1" stopColor="#D97706" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Center Petal */}
        <path
          d="M32 10C34.5 18 39 28 39 38C39 44 36 49 32 51C28 49 25 44 25 38C25 28 29.5 18 32 10Z"
          fill="url(#lotusGlow)"
          stroke="url(#lotusGold)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Inner Left Petal */}
        <path
          d="M30 18C25 25 18 33 19 42C19.5 46.5 23 49.5 28 50.5C27 44 28 35 30 27"
          fill="url(#lotusGlow)"
          stroke="url(#lotusGold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner Right Petal */}
        <path
          d="M34 18C39 25 46 33 45 42C44.5 46.5 41 49.5 36 50.5C37 44 36 35 34 27"
          fill="url(#lotusGlow)"
          stroke="url(#lotusGold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Outer Left Petal */}
        <path
          d="M26 28C18 33 10 40 12 47C13 50 17 52 23 51C20 46 21 38 24 33"
          stroke="url(#lotusGold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Outer Right Petal */}
        <path
          d="M38 28C46 33 54 40 52 47C51 50 47 52 41 51C44 46 43 38 40 33"
          stroke="url(#lotusGold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lotus Base / Calyx */}
        <path
          d="M17 50C22 53.5 27 54.5 32 54.5C37 54.5 42 53.5 47 50"
          stroke="url(#lotusGold)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="32" cy="38" r="2.5" fill="#D97706" />
      </svg>
      <div className="brand-text">
        <span className="brand-title">AAROGYAM AI</span>
        {showSubtitle && <span className="brand-subtitle">Ancient Wisdom. Intelligent Wellness.</span>}
      </div>
    </div>
  )
}
