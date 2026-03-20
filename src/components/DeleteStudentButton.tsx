'use client'

import { deleteStudent } from '@/app/actions'

export default function DeleteStudentButton({ id }: { id: string }) {
  return (
    <form action={deleteStudent.bind(null, id)}>
      <button
        type="submit"
        className="text-red-400 hover:text-red-600 transition-colors text-sm px-2 py-1 rounded hover:bg-red-50"
        title="Удалить ученика"
      >
        Удалить
      </button>
    </form>
  )
}
