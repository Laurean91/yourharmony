'use client'

import { useCallback, useMemo, useState } from 'react'
import type { GameTopic } from '@/lib/englishGames'

export type AnswerStatus = 'idle' | 'correct' | 'wrong'

export interface UseEnglishQuizResult {
  /** Current question index (0-based). */
  index: number
  /** Total number of questions in the topic. */
  total: number
  /** The current question object. */
  question: GameTopic['questions'][number]
  /** id of the option the child tapped (null before any tap). */
  selectedId: string | null
  /** Result of the current tap. */
  status: AnswerStatus
  /** How many questions have been answered correctly so far. */
  score: number
  /** Progress as a fraction 0..1 (based on answered questions). */
  progress: number
  /** True once the last question has been answered correctly. */
  finished: boolean
  /**
   * Handle a tap on an option. A wrong tap gives gentle feedback but does NOT
   * advance — the child can try again (encouraging, no "game over").
   */
  answer: (optionId: string) => void
  /** Move to the next question (called after a correct answer). */
  next: () => void
  /** Restart the whole topic from scratch. */
  restart: () => void
}

export function useEnglishQuiz(topic: GameTopic): UseEnglishQuizResult {
  const total = topic.questions.length

  const [index, setIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState<AnswerStatus>('idle')
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  // Track which question ids have already been credited so retries don't
  // inflate the score.
  const [answeredCorrect, setAnsweredCorrect] = useState<Set<string>>(new Set())

  const question = topic.questions[index]

  const answer = useCallback(
    (optionId: string) => {
      // Ignore taps while a correct answer is being celebrated.
      if (status === 'correct') return

      setSelectedId(optionId)

      if (optionId === question.correctOptionId) {
        setStatus('correct')
        if (!answeredCorrect.has(question.id)) {
          setScore(s => s + 1)
          setAnsweredCorrect(prev => {
            const next = new Set(prev)
            next.add(question.id)
            return next
          })
        }
      } else {
        // Gentle "try again" — show the wiggle, then automatically clear the
        // "wrong" state so the child can calmly try again. Handling the reset
        // here (rather than in an effect inside the view) keeps the component
        // free of cascading setState-in-effect calls.
        setStatus('wrong')
        window.setTimeout(() => {
          setStatus(current => (current === 'wrong' ? 'idle' : current))
          setSelectedId(current => (current === optionId ? null : current))
        }, 700)
      }
    },
    [status, question, answeredCorrect],
  )


  const next = useCallback(() => {
    if (index + 1 >= total) {
      setFinished(true)
      return
    }
    setIndex(i => i + 1)
    setSelectedId(null)
    setStatus('idle')
  }, [index, total])

  const restart = useCallback(() => {
    setIndex(0)
    setSelectedId(null)
    setStatus('idle')
    setScore(0)
    setFinished(false)
    setAnsweredCorrect(new Set())
  }, [])

  const progress = useMemo(() => {
    if (finished) return 1
    // Progress reflects how far along we are (current question position).
    return total === 0 ? 0 : index / total
  }, [index, total, finished])

  return {
    index,
    total,
    question,
    selectedId,
    status,
    score,
    progress,
    finished,
    answer,
    next,
    restart,
  }
}
