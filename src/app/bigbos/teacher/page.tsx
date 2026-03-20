export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getTeacherProfile } from '../../actions'
import TeacherForm from '../../../components/TeacherForm'
import { Eye } from 'lucide-react'

export default async function TeacherPage() {
  const teacher = await getTeacherProfile()

  return (
    <div className="p-8 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Профиль преподавателя</h1>
            <p className="text-gray-500 mt-1">Информация отображается в секции «Ваш преподаватель» на главной странице</p>
          </div>
          <Link
            href="/#teacher"
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors mt-1"
          >
            <Eye size={15} />
            Посмотреть на сайте
          </Link>
        </div>

        <TeacherForm teacher={teacher} />

      </div>
    </div>
  )
}
