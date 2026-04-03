'use client'

import { useState } from 'react'
import Image from 'next/image'

export interface Planet {
  id: string
  displayName: string   // first name only for others, full name for own child
  photoUrl: string | null // only provided for own child
  stars: number
  isOwn: boolean
}

// ── helpers ────────────────────────────────────────────────────────────────

function getPlanetSize(stars: number, maxStars: number): number {
  if (maxStars === 0) return 64
  return Math.round(60 + (stars / maxStars) * 60) // 60px – 120px
}

function getPlanetGradient(stars: number): string {
  if (stars >= 300) return 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)'  // gold
  if (stars >= 150) return 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'  // violet
  if (stars >= 50)  return 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'  // teal
  return               'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'      // blue
}

// Deterministic float delay from id hash (ms)
function floatDelay(id: string): number {
  let h = 5381
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0
  return (Math.abs(h) % 3000)
}

// Deterministic float duration (3–6s)
function floatDuration(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return 3 + (Math.abs(h) % 3)
}

// ── star field ─────────────────────────────────────────────────────────────

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => {
    const h = Math.abs((i * 2654435761) | 0)
    return {
      cx: (h % 1000) / 10,
      cy: ((h >> 8) % 1000) / 10,
      r:  0.4 + (h % 4) * 0.3,
      op: 0.15 + (h % 7) * 0.08,
    }
  })
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={`${s.cx}%`} cy={`${s.cy}%`} r={s.r} fill="white" opacity={s.op} />
      ))}
    </svg>
  )
}

// ── legend row ─────────────────────────────────────────────────────────────

const TIERS = [
  { label: '0–49',    from: '#3B82F6', to: '#1D4ED8' },
  { label: '50–149',  from: '#0D9488', to: '#0F766E' },
  { label: '150–299', from: '#8B5CF6', to: '#6D28D9' },
  { label: '300+',    from: '#F59E0B', to: '#F97316' },
]

// ── main component ─────────────────────────────────────────────────────────

export default function GalaxyMap({
  planets,
  myStudentIds,
}: {
  planets: Planet[]
  myStudentIds: string[]
}) {
  const [active, setActive] = useState<string | null>(null)
  const maxStars = Math.max(...planets.map(p => p.stars), 1)

  return (
    <div className="space-y-4">
      {/* Galaxy container */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 50%, #0f172a 100%)',
          minHeight: 480,
          boxShadow: '0 8px 48px rgba(139,92,246,0.25)',
        }}
      >
        {/* Float keyframes */}
        <style>{`
          @keyframes galaxy-float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50%       { transform: translateY(-10px) scale(1.03); }
          }
          @keyframes own-pulse {
            0%, 100% { box-shadow: 0 0 0 3px #fff, 0 0 0 6px #8B5CF6, 0 0 32px rgba(139,92,246,0.7); }
            50%       { box-shadow: 0 0 0 3px #fff, 0 0 0 6px #F97316, 0 0 48px rgba(249,115,22,0.6); }
          }
        `}</style>

        <StarField />

        {/* Nebula glow blobs */}
        <div className="absolute top-8 left-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />
        <div className="absolute bottom-12 right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)', filter: 'blur(24px)' }} />

        {/* Planets */}
        <div
          className="relative z-10 flex flex-wrap justify-center items-center gap-5 p-8"
          style={{ minHeight: 480 }}
        >
          {planets.map(planet => {
            const size = getPlanetSize(planet.stars, maxStars)
            const isOwn = myStudentIds.includes(planet.id)
            const delay = floatDelay(planet.id)
            const dur   = floatDuration(planet.id)

            return (
              <div key={planet.id} className="flex flex-col items-center gap-1.5">
                {/* Planet bubble */}
                <button
                  type="button"
                  aria-label={`${planet.displayName}, ${planet.stars} звёзд`}
                  onClick={() => setActive(active === planet.id ? null : planet.id)}
                  className="relative rounded-full flex items-center justify-center cursor-pointer focus:outline-none"
                  style={{
                    width: size,
                    height: size,
                    background: getPlanetGradient(planet.stars),
                    animation: isOwn
                      ? `galaxy-float ${dur}s ease-in-out ${delay}ms infinite, own-pulse 2.5s ease-in-out infinite`
                      : `galaxy-float ${dur}s ease-in-out ${delay}ms infinite`,
                    boxShadow: isOwn
                      ? '0 0 0 3px #fff, 0 0 0 6px #8B5CF6, 0 0 32px rgba(139,92,246,0.7)'
                      : '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Photo or initials */}
                  {planet.photoUrl ? (
                    <Image
                      src={planet.photoUrl}
                      alt={planet.displayName}
                      fill
                      sizes={`${size}px`}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-white font-extrabold select-none"
                      style={{ fontSize: Math.round(size * 0.32) }}
                    >
                      {planet.displayName[0].toUpperCase()}
                    </span>
                  )}

                  {/* Tooltip on tap/click */}
                  {active === planet.id && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-20 px-3 py-2 rounded-2xl text-center"
                      style={{
                        background: 'rgba(15,12,41,0.92)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <p className="text-white text-xs font-bold">{planet.displayName}</p>
                      <p className="text-yellow-300 text-[11px] font-semibold flex items-center justify-center gap-1 mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        {planet.stars} звёзд
                      </p>
                    </div>
                  )}
                </button>

                {/* Name */}
                <span className="text-[11px] font-semibold text-white/75 max-w-[80px] text-center truncate">
                  {planet.displayName}
                </span>

                {/* Stars count */}
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-300">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {planet.stars}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* How stars are earned */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#fff', border: '1.5px solid #d1fae5', boxShadow: '0 2px 12px rgba(5,150,105,0.06)' }}
        >
          <p className="text-sm font-extrabold text-gray-800 mb-2">Как копить звёзды</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex justify-between"><span>Посещение урока</span><b className="text-yellow-500">+10</b></li>
            <li className="flex justify-between"><span>Оценка «5»</span><b className="text-yellow-500">+15</b></li>
            <li className="flex justify-between"><span>Оценка «4»</span><b className="text-yellow-500">+10</b></li>
            <li className="flex justify-between"><span>Оценка «3»</span><b className="text-yellow-500">+5</b></li>
          </ul>
        </div>

        {/* Color legend */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#fff', border: '1.5px solid #d1fae5', boxShadow: '0 2px 12px rgba(5,150,105,0.06)' }}
        >
          <p className="text-sm font-extrabold text-gray-800 mb-2">Цвет планеты</p>
          <ul className="space-y-1">
            {TIERS.map(t => (
              <li key={t.label} className="flex items-center gap-2 text-xs text-gray-600">
                <span
                  className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                />
                {t.label} звёзд
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
