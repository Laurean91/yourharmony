'use client'

import { Trash2 } from 'lucide-react'
import { deletePost } from '../app/actions'

export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={async () => {
        if (!confirm(`Удалить статью "${title}"?`)) return
        await deletePost(id)
      }}
    >
      <button
        type="submit"
        className="p-2 rounded-lg transition-colors cursor-pointer"
        style={{ color: 'var(--adm-text-muted)' }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#ef4444'
          e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--adm-text-muted)'
          e.currentTarget.style.background = 'transparent'
        }}
        title="Удалить"
      >
        <Trash2 size={16} />
      </button>
    </form>
  )
}
