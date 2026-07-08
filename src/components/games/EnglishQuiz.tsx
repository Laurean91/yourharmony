'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Star } from 'lucide-react'
import type { GameTopic, QuizOption } from '@/lib/englishGames'
import { useEnglishQuiz } from '@/hooks/useEnglishQuiz'

interface EnglishQuizProps {
  topic: GameTopic
  /** Called when the child taps the "back to topics" button. */
  onExit: () => void
}

/* ─────────────────────── Progress bar ─────────────────────── */

function ProgressBar({
  index,
  total,
  gradient,
}: {
  index: number
  total: number
  gradient: [string, string]
}) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < index
        const current = i === index
        return (
          <div
            key={i}
            className="h-2.5 rounded-full flex-1 transition-all duration-500"
            style={{
              background: done || current
                ? `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`
                : 'rgba(79,70,229,0.12)',
              opacity: current ? 0.55 : 1,
            }}
          />
        )
      })}
    </div>
  )
}

/* ─────────────────────── Option tile ─────────────────────── */

function OptionTile({
  option,
  visual,
  state,
  disabled,
  onTap,
}: {
  option: QuizOption
  visual: 'emoji' | 'swatch' | 'flag'
  /** 'idle' | 'correct' | 'wrong' — how THIS tile should look. */
  state: 'idle' | 'correct' | 'wrong'
  disabled: boolean
  onTap: () => void
}) {
  const isSwatch = visual === 'swatch'

  const ring =
    state === 'correct'
      ? '0 0 0 4px rgba(16,185,129,0.6), 0 10px 30px rgba(16,185,129,0.35)'
      : state === 'wrong'
      ? '0 0 0 4px rgba(239,68,68,0.5)'
      : '0 4px 16px rgba(79,70,229,0.10)'

  return (
    <motion.button
      type="button"
      onClick={onTap}
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      className={`relative flex flex-col items-center justify-center rounded-3xl p-4 sm:p-6 select-none ${
        state === 'correct' ? 'game-pop' : ''
      } ${state === 'wrong' ? 'game-wiggle' : ''}`}
      style={{
        background: isSwatch ? option.color : '#ffffff',
        border: '3px solid',
        borderColor:
          state === 'correct'
            ? '#10B981'
            : state === 'wrong'
            ? '#EF4444'
            : 'rgba(79,70,229,0.10)',
        boxShadow: ring,
        minHeight: 128,
        cursor: disabled ? 'default' : 'pointer',
      }}
      aria-label={option.label}
    >
      {/* Big visual */}
      {isSwatch ? (
        <span className="text-4xl sm:text-5xl drop-shadow-sm" aria-hidden>
          {state === 'correct' ? '✅' : ''}
        </span>
      ) : (
        <span className="text-5xl sm:text-6xl leading-none" aria-hidden>
          {option.glyph}
        </span>
      )}

      {/* English label (secondary — for the reading adult) */}
      <span
        className="mt-2 text-sm sm:text-base font-extrabold tracking-tight"
        style={{
          color: isSwatch ? '#ffffff' : 'var(--par-text-primary)',
          textShadow: isSwatch ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
        }}
      >
        {option.label}
      </span>
    </motion.button>
  )
}

/* ─────────────────────── Completion screen ─────────────────────── */

function CompletionScreen({
  topic,
  score,
  total,
  onRestart,
  onExit,
}: {
  topic: GameTopic
  score: number
  total: number
  onRestart: () => void
  onExit: () => void
}) {
  const confetti = ['🎉', '⭐', '🌟', '🎊', '✨', '🏆', '🥳', '💫']

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative parent-glass rounded-3xl p-8 text-center overflow-hidden"
    >
      {/* Falling confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="game-confetti absolute text-2xl"
            style={{
              left: `${8 + i * 11}%`,
              top: 0,
              animationDelay: `${i * 0.18}s`,
            }}
            aria-hidden
          >
            {c}
          </span>
        ))}
      </div>

      <div className="game-burst-in text-7xl mb-3">{topic.emoji}</div>
      <h2 className="text-2xl font-extrabold" style={{ color: 'var(--par-text-primary)' }}>
        Ура! Молодец! 🎉
      </h2>
      <p className="mt-1 text-sm text-gray-500">Тема «{topic.title}» пройдена</p>

      {/* Score with stars */}
      <div className="mt-5 flex items-center justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <Star
            key={i}
            size={30}
            className="drop-shadow"
            fill={i < score ? '#FACC15' : 'transparent'}
            color={i < score ? '#FACC15' : '#D1D5DB'}
          />
        ))}
      </div>
      <p className="mt-3 text-lg font-extrabold" style={{ color: topic.gradient[0] }}>
        {score} из {total}
      </p>

      <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-extrabold text-white transition-transform active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${topic.gradient[0]}, ${topic.gradient[1]})`,
            boxShadow: `0 8px 22px ${topic.gradient[0]}55`,
          }}
        >
          <RotateCcw size={18} /> Ещё раз
        </button>
        <button
          onClick={onExit}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-extrabold transition-transform active:scale-95"
          style={{
            background: '#ffffff',
            color: 'var(--par-accent)',
            border: '2px solid var(--par-border-card)',
          }}
        >
          Другие игры
        </button>
      </div>
    </motion.div>
  )
}

/* ─────────────────────── Main quiz ─────────────────────── */

export default function EnglishQuiz({ topic, onExit }: EnglishQuizProps) {
  const quiz = useEnglishQuiz(topic)
  const { question, status, selectedId, index, total, finished } = quiz

  // After a correct answer, celebrate briefly, then auto-advance to the next
  // question. The "wrong" state is auto-cleared inside the hook, so the view
  // stays free of extra effects.
  useEffect(() => {
    if (status !== 'correct') return
    const t = setTimeout(() => quiz.next(), 1100)
    return () => clearTimeout(t)
  }, [status, quiz])

  if (finished) {
    return (
      <CompletionScreen
        topic={topic}
        score={quiz.score}
        total={total}
        onRestart={quiz.restart}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="parent-card-in">
      {/* Top bar: back + progress + counter */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onExit}
          className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-transform active:scale-90"
          style={{ background: '#ffffff', border: '2px solid var(--par-border-card)', color: 'var(--par-accent)' }}
          aria-label="Назад к темам"
        >
          <ArrowLeft size={18} />
        </button>
        <ProgressBar index={index} total={total} gradient={topic.gradient} />
        <span
          className="shrink-0 text-sm font-extrabold px-3 py-1 rounded-full"
          style={{ background: `${topic.gradient[0]}18`, color: topic.gradient[0] }}
        >
          {index + 1}/{total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Question card */}
          <div
            className="rounded-3xl p-6 text-center mb-5 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${topic.gradient[0]}, ${topic.gradient[1]})`,
              boxShadow: `0 10px 30px ${topic.gradient[0]}45`,
            }}
          >
            {question.promptGlyph && (
              <div className="game-float text-6xl sm:text-7xl mb-2 leading-none" aria-hidden>
                {question.promptGlyph}
              </div>
            )}
            <p className="text-xl sm:text-2xl font-extrabold text-white drop-shadow">
              {question.prompt}
            </p>
          </div>

          {/* Options grid — large, tappable tiles */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {question.options.map(opt => {
              const isSelected = selectedId === opt.id
              const isCorrectTarget =
                status === 'correct' && opt.id === question.correctOptionId
              const tileState: 'idle' | 'correct' | 'wrong' = isCorrectTarget
                ? 'correct'
                : isSelected && status === 'wrong'
                ? 'wrong'
                : 'idle'

              return (
                <OptionTile
                  key={opt.id}
                  option={opt}
                  visual={question.optionVisual}
                  state={tileState}
                  disabled={status === 'correct'}
                  onTap={() => quiz.answer(opt.id)}
                />
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback line */}
      <div className="h-10 mt-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {status === 'correct' && (
            <motion.p
              key="ok"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-lg font-extrabold flex items-center gap-2"
              style={{ color: '#10B981' }}
            >
              🎉 Отлично! Yes!
            </motion.p>
          )}
          {status === 'wrong' && (
            <motion.p
              key="try"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-base font-bold flex items-center gap-2"
              style={{ color: '#F97316' }}
            >
              🙂 Почти! Попробуй ещё
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
