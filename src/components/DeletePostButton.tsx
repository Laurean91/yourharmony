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
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Удалить"
      >
        <Trash2 size={16} />
      </button>
    </form>
  )
}
