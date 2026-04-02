'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
      style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
    >
      <Printer size={15} />
      Скачать PDF
    </button>
  )
}
