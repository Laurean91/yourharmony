export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getTeacherProfile, getTeacherPageContent } from '../../actions'
import TeacherForm from '../../../components/TeacherForm'
import { Eye } from 'lucide-react'

export default async function TeacherPage() {
  const [teacher, pageContent] = await Promise.all([
    getTeacherProfile(),
    getTeacherPageContent(),
  ])

  return (
    <div className="p-8 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Профиль преподавателя</h1>
            <p className="text-gray-500 mt-1">Информация отображается на главной странице и на странице преподавателя</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Link
              href="/#teacher"
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Eye size={15} />
              Главная
            </Link>
            <Link
              href="/teacher"
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Eye size={15} />
              Страница /teacher
            </Link>
          </div>
        </div>

        <TeacherForm teacher={teacher} pageContent={pageContent} />

      </div>
    </div>
  )
}
