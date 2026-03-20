'use client'

import { useEffect, useState } from 'react'

export default function WelcomeOverlay() {
  const [show, setShow] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('welcomed')) {
      sessionStorage.setItem('welcomed', '1')
      setShow(true)
      setTimeout(() => setFading(true), 2000)
      setTimeout(() => setShow(false), 2800)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-orange-500"
      style={{
        opacity: fading ? 0 : 1,
        transition: fading ? 'opacity 0.8s ease' : 'none',
      }}
    >
      <div className="text-center text-white select-none">
        <p className="text-5xl font-extrabold mb-3 tracking-tight drop-shadow-lg">
          Добро пожаловать
        </p>
        <p className="text-3xl font-bold opacity-90">Наталья ✨</p>
      </div>
    </div>
  )
}
