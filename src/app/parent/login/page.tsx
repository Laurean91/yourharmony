'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function ParentLoginPage() {
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
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
        router.push('/parent')
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
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1e1535 100%)' }}
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="animate-float-pulse absolute rounded-full"
          style={{
            width: 480, height: 480,
            top: '-10%', right: '-5%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)',
          }}
        />
        <div
          className="animate-float-pulse absolute rounded-full"
          style={{
            width: 360, height: 360,
            bottom: '-5%', left: '-8%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 65%)',
            animationDelay: '4s',
          }}
        />
        <div
          className="animate-float-pulse absolute rounded-full"
          style={{
            width: 200, height: 200,
            top: '55%', right: '20%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 65%)',
            animationDelay: '2s',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0v40M40 0v40M0 0h40M0 40h40' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Left panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[440px] shrink-0 relative overflow-hidden">
        {/* Top logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10 hover:opacity-80 transition-opacity">
          <div style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.55))' }}>
            <Image src="/logo.svg" width={52} height={52} alt="Гармония" />
          </div>
          <div>
            <p
              className="text-lg font-extrabold leading-tight"
              style={{
                background: 'linear-gradient(90deg, #c4b5fd 0%, #f9a8d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Гармония
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'rgba(196,181,253,0.45)' }}>
              Кабинет родителя
            </p>
          </div>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div>
            <p
              className="text-[40px] font-extrabold leading-tight mb-4"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              Следите за<br />успехами<br />
              <span style={{
                background: 'linear-gradient(90deg, #c4b5fd 0%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                вашего ребёнка
              </span>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Расписание, оценки и посещаемость<br />в одном месте.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['📅 Расписание', '⭐ Оценки', '✅ Посещения', '🌟 Прогресс'].map(item => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Клуб «Гармония» · Английский для детей
        </p>
      </div>

      {/* Vertical divider — desktop */}
      <div
        className="hidden lg:block w-px my-16 shrink-0"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.25), transparent)' }}
      />

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm animate-fade-slide-up">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex flex-col items-center mb-8 hover:opacity-80 transition-opacity">
            <div style={{ filter: 'drop-shadow(0 0 16px rgba(139,92,246,0.5))' }}>
              <Image src="/logo.svg" width={52} height={52} alt="Гармония" />
            </div>
            <p
              className="text-lg font-extrabold mt-2"
              style={{
                background: 'linear-gradient(90deg, #c4b5fd 0%, #f9a8d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Гармония
            </p>
          </Link>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <h1
              className="text-2xl font-extrabold mb-1"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              Добро пожаловать
            </h1>
            <p className="text-sm mb-7" style={{ color: 'rgba(196,181,253,0.55)' }}>
              Войдите в кабинет родителя
            </p>

            {error && (
              <div
                className="flex items-center gap-2.5 text-sm mb-5 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <span className="shrink-0">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                  style={{ color: 'rgba(196,181,253,0.6)' }}
                >
                  Логин
                </label>
                <input
                  id="username" name="username" type="text" required autoComplete="username"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                  style={{ color: 'rgba(196,181,253,0.6)' }}
                >
                  Пароль
                </label>
                <div className="relative">
                  <input
                    id="password" name="password"
                    type={showPass ? 'text' : 'password'}
                    required autoComplete="current-password"
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.9)',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(196,181,253,0.4)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(196,181,253,0.8)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(196,181,253,0.4)' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold text-white mt-2 transition-all duration-200"
                style={{
                  background: loading
                    ? 'rgba(139,92,246,0.4)'
                    : 'linear-gradient(90deg, #7c3aed 0%, #f97316 100%)',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(124,58,237,0.4)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 6px 32px rgba(124,58,237,0.55)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 24px rgba(124,58,237,0.4)'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
    </div>
  )
}
