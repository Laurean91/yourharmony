'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, ChevronRight } from 'lucide-react'
import { GAME_TOPICS, type GameTopic, type GameTopicId } from '@/lib/englishGames'
import EnglishQuiz from './EnglishQuiz'

/* ─────────────────────── Topic card ─────────────────────── */

function TopicCard({
  topic,
  index,
  onSelect,
}: {
  topic: GameTopic
  index: number
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      className={`parent-card-in parent-delay-${index + 1} group relative text-left rounded-3xl p-5 overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${topic.gradient[0]}, ${topic.gradient[1]})`,
        boxShadow: `0 10px 30px ${topic.gradient[0]}45`,
      }}
    >
      {/* Decorative floating emoji in the corner */}
      <span
        className="absolute -right-3 -top-4 text-[110px] leading-none opacity-20 select-none pointer-events-none"
        aria-hidden
      >
        {topic.emoji}
      </span>

      <div className="relative z-10 flex items-center gap-4">
        <div
          className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          {topic.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-extrabold text-white drop-shadow">{topic.title}</h3>
          <p className="text-sm font-semibold text-white/85">{topic.subtitle}</p>
          <p className="text-xs text-white/70 mt-1">{topic.questions.length} заданий</p>
        </div>
        <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
          style={{ background: 'rgba(255,255,255,0.25)' }}>
          <ChevronRight size={20} className="text-white" />
        </div>
      </div>
    </motion.button>
  )
}

/* ─────────────────────── Module wrapper ─────────────────────── */

export default function EnglishGamesModule() {
  const [activeId, setActiveId] = useState<GameTopicId | null>(null)
  const activeTopic = GAME_TOPICS.find(t => t.id === activeId) ?? null

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
      {/* Header — matches the parent-cabinet page convention */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #818CF8)' }}
        >
          <Gamepad2 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Игры English 🎈</h1>
          <p className="text-xs text-gray-400">
            {activeTopic
              ? 'Нажимай на картинку с правильным ответом'
              : 'Выбери тему и играй — учим английский весело'}
          </p>
        </div>
      </div>

      {activeTopic ? (
        <EnglishQuiz topic={activeTopic} onExit={() => setActiveId(null)} />
      ) : (
        <div className="flex flex-col gap-4">
          {GAME_TOPICS.map((topic, i) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              index={i}
              onSelect={() => setActiveId(topic.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
