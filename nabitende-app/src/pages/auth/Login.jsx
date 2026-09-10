import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { School, Eye, EyeOff, LogIn } from 'lucide-react'

const ROLE_HINTS = [
  { role: 'School Head', email: 'admin@educonnect.ug',   color: '#ea580c', bg: '#fff7ed' },
  { role: 'Teacher',     email: 'teacher@educonnect.ug', color: '#1a6b4a', bg: '#f0fdf4' },
  { role: 'Parent',      email: 'parent@educonnect.ug',  color: '#0891b2', bg: '#ecfeff' },
  { role: 'Student',     email: 'student@educonnect.ug', color: '#7c3aed', bg: '#faf5ff' },
  { role: 'Government',  email: 'gov@educonnect.ug',     color: '#1d4ed8', bg: '#eff6ff' },
]

const PASSWORD_MAP = {
  'admin@educonnect.ug':   'admin123',
  'teacher@educonnect.ug': 'teacher123',
  'parent@educonnect.ug':  'parent123',
  'student@educonnect.ug': 'student123',
  'gov@educonnect.ug':     'gov123',
}

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
  e.preventDefault()
  setError('')
  setLoading(true)
  const result = await login(email, password)
  setLoading(false)
  if (!result.ok) { setError(result.error); return }
  navigate(result.home, { replace: true })
 }

  function fillHint(emailVal) {
    setEmail(emailVal)
    setPassword(PASSWORD_MAP[emailVal] || '')
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg)]">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col w-[400px] min-w-[400px]
        bg-[#1a6b4a] text-white">

        {/* Top: logo */}
        <div className="px-8 pt-10 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20
              flex items-center justify-center flex-shrink-0">
              <School size={20} className="text-white" />
            </div>
            <span className="text-[18px] font-bold tracking-tight">
              EduConnect
            </span>
          </div>
        </div>

        {/* Middle: headline */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12">
          <h1 className="text-[32px] font-bold leading-tight mb-5">
            Connecting schools,<br />parents &amp;<br />government.
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed">
            One platform for students, teachers, parents,
            school heads and government officials to
            work together efficiently.
          </p>
        </div>

        {/* Bottom: role hints */}
        <div className="px-6 pb-8">
          <p className="text-[10px] font-semibold text-white/40
            uppercase tracking-widest mb-3 px-2">
            Quick sign in as
          </p>
          <div className="space-y-1.5">
            {ROLE_HINTS.map((h) => (
              <button
                key={h.role}
                onClick={() => fillHint(h.email)}
                className="w-full flex items-center gap-3 px-3 py-3
                  rounded-xl transition-all text-left
                  hover:bg-white/15 active:bg-white/20"
                style={{
                  background: email === h.email
                    ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center
                    text-[12px] font-bold flex-shrink-0"
                  style={{ background: h.bg, color: h.color }}
                >
                  {h.role[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold leading-tight">
                    {h.role}
                  </div>
                  <div className="text-[11px] text-white/50 truncate mt-0.5">
                    {h.email}
                  </div>
                </div>
                <span className="text-white/30 text-[12px] flex-shrink-0">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center
        px-6 py-16 lg:py-0">

        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-[#1a6b4a]
              flex items-center justify-center">
              <School size={20} className="text-white" />
            </div>
            <span className="text-[18px] font-bold text-[var(--color-text)]">
              EduConnect
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[32px] font-bold text-[var(--color-text)]
              leading-tight mb-2">
              Welcome back
            </h2>
            <p className="text-[15px] text-[var(--color-text-muted)]">
              Sign in to your EduConnect account
            </p>
          </div>

          {/* Mobile role pills */}
          <div className="lg:hidden grid grid-cols-3 gap-2 mb-8">
            {ROLE_HINTS.map((h) => (
              <button
                key={h.role}
                onClick={() => fillHint(h.email)}
                className="py-2.5 px-2 rounded-xl text-[12px] font-semibold
                  border-2 transition-all active:scale-95 text-center"
                style={{
                  color:       h.color,
                  borderColor: email === h.email ? h.color : '#e2e8f0',
                  background:  email === h.email ? h.bg    : 'white',
                }}
              >
                {h.role}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email field */}
            <div>
              <label className="block text-[14px] font-semibold
                text-[var(--color-text)] mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@educonnect.ug"
                required
                className="w-full px-4 py-3.5 rounded-xl
                  border-2 border-[var(--color-border)]
                  bg-white text-[15px] text-[var(--color-text)]
                  placeholder:text-[var(--color-text-muted)]
                  focus:outline-none focus:border-[#1a6b4a]
                  focus:ring-4 focus:ring-[#1a6b4a]/10
                  transition-all"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[14px] font-semibold
                text-[var(--color-text)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 pr-13 rounded-xl
                    border-2 border-[var(--color-border)]
                    bg-white text-[15px] text-[var(--color-text)]
                    placeholder:text-[var(--color-text-muted)]
                    focus:outline-none focus:border-[#1a6b4a]
                    focus:ring-4 focus:ring-[#1a6b4a]/10
                    transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                    text-[var(--color-text-muted)]
                    hover:text-[var(--color-text)] transition-colors p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="px-4 py-3.5 rounded-xl
                bg-red-50 border-2 border-red-200
                text-red-700 text-[14px] font-medium">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5
                px-4 py-4 rounded-xl
                bg-[#1a6b4a] hover:bg-[#15573c] active:bg-[#124a33]
                text-white text-[16px] font-semibold
                transition-all disabled:opacity-60 disabled:cursor-not-allowed
                shadow-sm hover:shadow-md mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30
                  border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-10 text-center text-[13px] text-[var(--color-text-muted)]">
            EduConnect · Uganda · Term 2, 2026
          </p>
        </div>
      </div>
    </div>
  )
}