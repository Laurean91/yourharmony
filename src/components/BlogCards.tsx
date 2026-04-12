'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatDate } from '../lib/utils'

type Post = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  createdAt: Date
  category: { name: string } | null
}

const GAP = 24 // px

export default function BlogCards({ posts }: { posts: Post[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)
  const [current, setCurrent] = useState(0)
  const [dragging, setDragging] = useState(false)
  const total = posts.length

  useEffect(() => {
    const calc = () => {
      if (!trackRef.current) return
      const v = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3
      setVisibleCount(v)
      const w = trackRef.current.offsetWidth
      setCardWidth((w - GAP * (v - 1)) / v)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const stepPx = cardWidth + GAP
  const maxIdx = Math.max(0, total - visibleCount)

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, maxIdx))
    setCurrent(clamped)
  }

  const prev = () => goTo(current - 1)
  const next = () => goTo(current + 1)

  // Автопрокрутка
  useEffect(() => {
    if (!stepPx || total <= visibleCount) return
    const id = setInterval(() => {
      setCurrent(c => (c >= maxIdx ? 0 : c + 1))
    }, 4500)
    return () => clearInterval(id)
  }, [stepPx, total, visibleCount, maxIdx])

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    setDragging(false)
    const threshold = stepPx * 0.25
    if (info.offset.x < -threshold) goTo(current + 1)
    else if (info.offset.x > threshold) goTo(current - 1)
    else goTo(current)
  }

  if (total === 0) return null

  return (
    <div>
      {/* Трек */}
      <div ref={trackRef} className="overflow-hidden">
        <motion.div
          className="flex"
          style={{ gap: GAP, cursor: dragging ? 'grabbing' : 'grab' }}
          drag="x"
          dragConstraints={{ left: -(maxIdx * stepPx), right: 0 }}
          dragElastic={0.08}
          animate={{ x: -(current * stepPx) }}
          transition={{ type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.45 }}
          onDragStart={() => setDragging(true)}
          onDragEnd={handleDragEnd}
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              style={{ minWidth: cardWidth || `calc((100% - ${GAP * (visibleCount - 1)}px) / ${visibleCount})` }}
              whileHover={dragging ? {} : { y: -4, transition: { duration: 0.2 } }}
              className="select-none"
            >
              <Link
                href={`/blog/${post.slug}`}
                draggable={false}
                onClick={e => { if (dragging) e.preventDefault() }}
                className="group flex flex-col bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-lg transition-shadow duration-300 h-full"
              >
                {/* Cover */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      draggable={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      📝
                    </div>
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {post.category.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  <time className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                    {formatDate(post.createdAt, false)}
                  </time>
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="mt-4 text-sm font-semibold text-purple-600 flex items-center gap-1">
                    Читать
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Навигация */}
      {total > visibleCount && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-10 h-10 rounded-full bg-white/70 border border-white/60 shadow flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-30"
            aria-label="Назад"
          >←</button>

          <div className="flex gap-2">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-2.5 bg-purple-500' : 'w-2.5 h-2.5 bg-gray-300'}`}
                aria-label={`Статья ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={current >= maxIdx}
            className="w-10 h-10 rounded-full bg-white/70 border border-white/60 shadow flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-30"
            aria-label="Вперёд"
          >→</button>
        </div>
      )}
    </div>
  )
}
