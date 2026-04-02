'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import Image from 'next/image'

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
      style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float-pulse absolute top-1/4 left-1/6 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
        <div className="animate-float-pulse absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', animationDelay: '3.5s' }} />
      </div>

      {/* Left panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[420px] shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="rounded-2xl overflow-hidden" style={{ width: 56, height: 56, filter: 'drop-shadow(0 0 18px rgba(52,211,153,0.5))' }}>
            <Image src="/logo.png" width={56} height={56} alt="Гармония" className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="text-xl font-extrabold leading-tight"
              style={{ background: 'linear-gradient(90deg, #34d399 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Гармония
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] leading-tight"
              style={{ color: 'rgba(52,211,153,0.5)' }}>
              Кабинет родителя
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-3xl font-extrabold leading-snug mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Следите за<br/>успехами<br/>
            <span style={{ background: 'linear-gradient(90deg, #34d399 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              вашего ребёнка
            </span>
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Расписание, оценки и посещаемость<br/>в одном месте.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm rounded-2xl p-8 animate-fade-slide-up"
          style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}>

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{ width: 56, height: 56 }}>
              <Image src="/logo.png" width={56} height={56} alt="Гармония" className="object-cover w-full h-full" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Добро пожаловать</h1>
          <p className="text-sm text-gray-400 mb-7">Войдите в кабинет родителя</p>

          {error && (
            <div className="flex items-center gap-2.5 text-sm mb-5 px-4 py-3 rounded-xl"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Логин
              </label>
              <input
                id="username" name="username" type="text" required autoComplete="username"
                className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 outline-none"
                style={{ border: '1.5px solid #e5e7eb', background: '#fafafa', transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; e.currentTarget.style.background = '#fff' }}
                onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#fafafa' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password" name="password" type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 outline-none"
                  style={{ border: '1.5px solid #e5e7eb', background: '#fafafa', transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; e.currentTarget.style.background = '#fff' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#fafafa' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold text-white mt-2"
              style={{
                background: loading ? '#9ca3af' : 'linear-gradient(90deg, #059669 0%, #3b82f6 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(5,150,105,0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(5,150,105,0.4)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(5,150,105,0.3)' }}>
              {loading ? (
                <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>Вход...</>
              ) : (
                <><LogIn size={16} />Войти</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
