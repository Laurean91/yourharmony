'use client'

import { Download } from 'lucide-react'

export default function PrintButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const safeName = studentName.replace(/[^а-яёА-ЯЁa-zA-Z0-9 _-]/g, '').trim()

  return (
    <a
      href={`/api/admin/students/${studentId}/report`}
      download={`Отчёт — ${safeName}.pdf`}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
      style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
    >
      <Download size={15} />
      Скачать PDF
    </a>
  )
}
