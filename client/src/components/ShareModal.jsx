import { useState } from 'react'
import { Check, Copy, ExternalLink, Mail, MessageCircle, Send, Share2, X } from 'lucide-react'

function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function ShareModal({ isOpen, onClose, query = 'wellness', guideTitle = '' }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/results?q=${encodeURIComponent(query)}`
    : ''

  const shareTitle = guideTitle || `AAROGYAM AI — Natural Remedies for ${query}`
  const shareText = `Explore holistic Ayurvedic home remedies, restorative yoga, and wellness guide for "${query}" on AAROGYAM AI.`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      const input = document.getElementById('share-url-input')
      if (input) {
        input.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        onClose()
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy()
        }
      }
    } else {
      handleCopy()
    }
  }

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n\n👉 View Remedies: ${shareUrl}`
  )}`

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    `Ayurvedic Remedies & Wellness Guide for ${query}`
  )}&body=${encodeURIComponent(
    `Hello,\n\nI thought this might be helpful for you. Here are natural remedies and yoga practices for ${query} from AAROGYAM AI:\n\n${shareUrl}\n\nTake care!`
  )}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#ffffff] border border-[#d97706]/20 shadow-[0_20px_50px_rgba(21,41,30,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-[#ecfdf5] blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6b6357] hover:bg-[#f7efe2] hover:text-[#072316] transition-colors"
          aria-label="Close share dialog"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] flex items-center justify-center text-xl mb-3 shadow-inner">
            <Share2 size={22} />
          </div>
          <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-widest mb-1">
            GIFT OF WELLNESS
          </span>
          <h2 id="share-modal-title" className="font-serif text-[22px] font-bold text-[#072316]">
            Share Remedies with Others
          </h2>
          <p className="text-[13px] text-[#6b6357] mt-1 max-w-xs">
            Pass on natural healing and yoga practices for <strong className="text-[#072316]">{query}</strong> to help friends and loved ones.
          </p>
        </div>

        {/* Link Copy Box */}
        <div className="mb-5">
          <label htmlFor="share-url-input" className="block text-[11px] font-bold uppercase tracking-wider text-[#8c7e6d] mb-1.5">
            Direct Remedies Link
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#f7efe2]/60 border border-[#d97706]/20">
            <input
              id="share-url-input"
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-transparent border-0 outline-none px-3 text-[12.5px] text-[#251910] truncate select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-[12px] transition-all ${
                copied
                  ? 'bg-[#065f46] text-white shadow-xs'
                  : 'bg-[#1e392a] hover:bg-[#15291e] text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#075e54] transition-all group"
          >
            <MessageCircle size={22} className="text-[#25D366] group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold">WhatsApp</span>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#0088cc] transition-all group"
          >
            <Send size={22} className="group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold">Telegram</span>
          </a>

          <a
            href={twitterUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 transition-all group"
          >
            <XIcon size={18} className="group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[11px] font-bold">X / Twitter</span>
          </a>

          <a
            href={mailtoUrl}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#d97706]/10 hover:bg-[#d97706]/20 border border-[#d97706]/30 text-[#b45309] transition-all group"
          >
            <Mail size={22} className="group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold">Email</span>
          </a>
        </div>

        {/* Native Share on mobile or system */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl border border-[#d97706]/20 bg-[#fbf6ee] hover:bg-[#f7efe2] text-[#072316] font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 size={15} />
            <span>More Sharing Options</span>
          </button>
        )}
      </div>
    </div>
  )
}
