import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Sparkles, User, X } from 'lucide-react'
import { DEMO_ACCOUNTS, useAuth } from '../context/AuthContext.jsx'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp, loginDemo } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isAuthModalOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!email.trim()) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpErr } = await signUp({
          email: email.trim(),
          password,
          name: name.trim(),
        })
        if (signUpErr) {
          setError(signUpErr.message)
        } else if (!data?.session) {
          setSuccessMessage('Account created! Please check your email to confirm your account.')
        }
      } else {
        const { error: signInErr } = await signIn({
          email: email.trim(),
          password,
        })
        if (signInErr) {
          setError(signInErr.message)
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#072316]/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-[420px] p-6 sm:p-8 rounded-[28px] bg-[#ffffff] border border-[#d97706]/20 shadow-[0_24px_60px_rgba(7,35,22,0.18)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle ambient glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#f59e0b]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[#10b981]/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8c7e6d] hover:bg-[#f7efe2] hover:text-[#072316] transition-colors"
          aria-label="Close authentication dialog"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] flex items-center justify-center text-2xl mb-2.5 shadow-xs">
            🪷
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] text-[10.5px] font-bold tracking-widest uppercase mb-2">
            <Sparkles size={11} className="text-[#065f46]" />
            <span>Aarogyam Sanctuary</span>
          </div>
          <h2 id="auth-modal-title" className="font-serif text-[24px] font-bold text-[#072316] tracking-tight">
            {mode === 'signin' ? 'Sign In to Your Account' : 'Create Your Account'}
          </h2>
          <p className="text-[13px] text-[#6b6357] mt-1 max-w-[320px] leading-relaxed">
            {mode === 'signin'
              ? 'Access your saved wellness inquiries and classical Ayurvedic recommendations.'
              : 'Save your personalized inquiries and explore ancient restorative wisdom.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-[#f7efe2]/80 p-1 mb-5 border border-[#d97706]/15">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError('')
              setSuccessMessage('')
            }}
            className={`flex-1 py-1.5 text-center text-[13px] rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#ffffff] text-[#072316] font-bold shadow-xs'
                : 'text-[#6b6357] font-semibold hover:text-[#072316]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError('')
              setSuccessMessage('')
            }}
            className={`flex-1 py-1.5 text-center text-[13px] rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#ffffff] text-[#072316] font-bold shadow-xs'
                : 'text-[#6b6357] font-semibold hover:text-[#072316]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#55483a] mb-1.5" htmlFor="auth-name">
                Your Full Name
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3.5 text-[#8c7e6d] pointer-events-none" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Aarav Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#d97706]/20 bg-[#fbf6ee]/30 text-[#072316] text-[13.5px] placeholder:text-[#8c7e6d]/60 focus:outline-none focus:border-[#065f46] focus:ring-2 focus:ring-[#065f46]/10 focus:bg-[#ffffff] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#55483a] mb-1.5" htmlFor="auth-email">
              Email Address <span className="text-[#ea580c]">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-[#8c7e6d] pointer-events-none" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#d97706]/20 bg-[#fbf6ee]/30 text-[#072316] text-[13.5px] placeholder:text-[#8c7e6d]/60 focus:outline-none focus:border-[#065f46] focus:ring-2 focus:ring-[#065f46]/10 focus:bg-[#ffffff] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#55483a] mb-1.5" htmlFor="auth-password">
              Password <span className="text-[#ea580c]">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-[#8c7e6d] pointer-events-none" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#d97706]/20 bg-[#fbf6ee]/30 text-[#072316] text-[13.5px] placeholder:text-[#8c7e6d]/60 focus:outline-none focus:border-[#065f46] focus:ring-2 focus:ring-[#065f46]/10 focus:bg-[#ffffff] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#8c7e6d] hover:text-[#072316] p-1 rounded-md transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[12.5px] font-medium leading-relaxed" role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-xl bg-[#ecfdf5] border border-[#065f46]/20 text-[#065f46] text-[12.5px] font-medium leading-relaxed" role="status">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-full bg-[#1e392a] hover:bg-[#15291e] active:scale-[0.99] text-[#ffffff] font-semibold text-[13.5px] transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#d97706]/15" />
          </div>
          <div className="relative flex justify-center text-[10.5px] uppercase tracking-wider font-bold">
            <span className="bg-[#ffffff] px-3 text-[#8c7e6d]">Or explore with demo profile</span>
          </div>
        </div>

        {/* Demo Fast Login */}
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((demo, idx) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => loginDemo(idx)}
              className="group p-2 rounded-xl bg-[#fbf6ee]/70 hover:bg-[#ffffff] border border-[#d97706]/20 hover:border-[#065f46]/40 hover:shadow-xs text-left transition-all flex items-center gap-2"
            >
              <span className="text-base w-7 h-7 rounded-lg bg-[#ffffff] group-hover:bg-[#ecfdf5] border border-[#d97706]/15 flex items-center justify-center transition-colors shrink-0">
                {demo.avatar}
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-bold text-[#072316] truncate group-hover:text-[#065f46] transition-colors">
                  {demo.name}
                </p>
                <p className="text-[10px] text-[#8c7e6d] truncate">Vedic Profile</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-[#8c7e6d] flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-[#065f46]" />
            <span>Private &amp; Secure · Ancient Vedic Wisdom</span>
          </p>
        </div>
      </div>
    </div>
  )
}
