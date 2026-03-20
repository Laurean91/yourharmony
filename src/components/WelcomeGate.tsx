'use client'

import { useEffect, useState } from 'react'

export default function WelcomeGate({ children }: { children: React.ReactNode }) {
  // null = ещё не определено (до useEffect)
  const [showOverlay, setShowOverlay] = useState<boolean | null>(null)
  const [overlayFading, setOverlayFading] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('welcomed')) {
      sessionStorage.setItem('welcomed', '1')
      setShowOverlay(true)
      // Начинаем растворять оверлей через 2 сек
      setTimeout(() => setOverlayFading(true), 2000)
      // Показываем контент чуть раньше окончания растворения
      setTimeout(() => setContentVisible(true), 2400)
      // Убираем оверлей из DOM
      setTimeout(() => setShowOverlay(false), 2900)
    } else {
      setShowOverlay(false)
      setContentVisible(true)
    }
  }, [])

  return (
    <>
      {/* Приветствие */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-orange-500 pointer-events-none"
          style={{
            opacity: overlayFading ? 0 : 1,
            transition: overlayFading ? 'opacity 0.9s ease' : 'none',
          }}
        >
          <div className="text-center text-white select-none">
            <p className="text-5xl font-extrabold mb-3 tracking-tight drop-shadow-lg">
              Добро пожаловать
            </p>
            <p className="text-3xl font-bold opacity-90">Наталья ✨</p>
          </div>
        </div>
      )}

      {/* Контент — скрыт до окончания приветствия */}
      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: contentVisible ? 'opacity 0.5s ease' : 'none',
        }}
      >
        {children}
      </div>
    </>
  )
}
