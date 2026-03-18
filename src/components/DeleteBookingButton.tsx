'use client'

import { Trash2 } from 'lucide-react'
import { deleteBooking } from '../app/actions'

export default function DeleteBookingButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        if (!confirm('Удалить заявку?')) return
        await deleteBooking(id)
      }}
    >
      <button
        type="submit"
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Удалить заявку"
      >
        <Trash2 size={15} />
      </button>
    </form>
  )
}
