'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      const result = await signIn('credentials', {
        username: form.get('username'),
        password: form.get('password'),
        redirect: false,
      })
      setLoading(false)
      if (result?.error || !result?.ok) {
        setError('Неверный логин или пароль')
      } else {
        router.push('/bigbos')
        router.refresh()
      }
    } catch {
      setLoading(false)
      setError('Неверный логин или пароль')
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'linear-gradient(135deg, #1c1045 0%, #130b35 50%, #0f0828 100%)',
      }}
    >
      {/* Left decorative panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[420px] shrink-0 relative overflow-hidden">
        {/* Glow orbs */}
        <div
          className="absolute top-20 left-10 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-32 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lg-gA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa"/>
                <stop offset="100%" stopColor="#7c3aed"/>
              </linearGradient>
              <linearGradient id="lg-gB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c"/>
                <stop offset="100%" stopColor="#f97316"/>
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="64" height="48" rx="14" fill="url(#lg-gA)"/>
            <polygon points="52,52 65,52 61,64" fill="#7c3aed"/>
            <rect x="36" y="54" width="58" height="40" rx="12" fill="url(#lg-gB)"/>
            <polygon points="40,54 52,54 43,44" fill="#f97316"/>
            <path d="M22 28 L23.1 24.9 L26 23.8 L23.1 22.7 L22 19.6 L20.9 22.7 L18 23.8 L20.9 24.9Z" fill="white" opacity="0.95"/>
            <path d="M36 28 L37.1 24.9 L40 23.8 L37.1 22.7 L36 19.6 L34.9 22.7 L32 23.8 L34.9 24.9Z" fill="white" opacity="0.88"/>
            <path d="M50 28 L51.1 24.9 L54 23.8 L51.1 22.7 L50 19.6 L48.9 22.7 L46 23.8 L48.9 24.9Z" fill="white" opacity="0.75"/>
            <path d="M50 70 Q65 80 80 70" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85"/>
          </svg>
          <div>
            <p
              className="text-xl font-extrabold leading-tight"
              style={{
                background: 'linear-gradient(90deg, #c4b5fd 0%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Гармония
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] leading-tight"
              style={{ color: 'rgba(167,139,250,0.5)' }}
            >
              Языковой клуб
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <p className="text-3xl font-extrabold leading-snug mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Панель<br/>управления<br/>
            <span style={{
              background: 'linear-gradient(90deg, #c4b5fd 0%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              клуба Гармония
            </span>
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Управление учениками, расписанием,<br/>финансами и сайтом в одном месте.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-sm rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.97)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ml-gA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#7C3AED"/>
                </linearGradient>
                <linearGradient id="ml-gB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316"/>
                  <stop offset="100%" stopColor="#EC4899"/>
                </linearGradient>
              </defs>
              <rect x="4" y="4" width="64" height="48" rx="14" fill="url(#ml-gA)"/>
              <polygon points="52,52 65,52 61,64" fill="#7C3AED"/>
              <rect x="36" y="54" width="58" height="40" rx="12" fill="url(#ml-gB)"/>
              <polygon points="40,54 52,54 43,44" fill="#F97316"/>
              <path d="M22 28 L23.1 24.9 L26 23.8 L23.1 22.7 L22 19.6 L20.9 22.7 L18 23.8 L20.9 24.9Z" fill="white" opacity="0.95"/>
              <path d="M36 28 L37.1 24.9 L40 23.8 L37.1 22.7 L36 19.6 L34.9 22.7 L32 23.8 L34.9 24.9Z" fill="white" opacity="0.88"/>
              <path d="M50 28 L51.1 24.9 L54 23.8 L51.1 22.7 L50 19.6 L48.9 22.7 L46 23.8 L48.9 24.9Z" fill="white" opacity="0.75"/>
              <path d="M50 70 Q65 80 80 70" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85"/>
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Добро пожаловать</h1>
          <p className="text-sm text-gray-400 mb-7">Войдите в панель управления</p>

          {error && (
            <div
              className="flex items-center gap-2.5 text-sm mb-5 px-4 py-3 rounded-xl"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
            >
              <span className="shrink-0 text-base">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Логин
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                style={{
                  border: '1.5px solid #e5e7eb',
                  background: '#fafafa',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'
                  e.currentTarget.style.background = '#fff'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = '#fafafa'
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 transition-all outline-none"
                  style={{
                    border: '1.5px solid #e5e7eb',
                    background: '#fafafa',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#7c3aed'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'
                    e.currentTarget.style.background = '#fff'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.background = '#fafafa'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold text-white transition-all mt-2"
              style={{
                background: loading
                  ? 'linear-gradient(90deg, #9ca3af 0%, #9ca3af 100%)'
                  : 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Вход...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Войти
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
