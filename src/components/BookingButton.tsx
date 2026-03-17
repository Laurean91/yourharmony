'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import BookingModal from './BookingModal'

interface BookingButtonProps {
  /** Additional Tailwind classes for the button */
  className?: string
  children?: React.ReactNode
}

export default function BookingButton({ className, children }: BookingButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className}
      >
        {children ?? 'Записаться на пробное занятие'}
      </button>

      <AnimatePresence>
        {showModal && <BookingModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}
