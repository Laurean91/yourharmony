export const dynamic = 'force-dynamic'

import { getBookings, getLessons, getStudents, getAllPostsAdmin, updateBookingStatus } from '../actions'
import LessonCalendar from '@/components/LessonCalendar'
import DeleteBookingButton from '@/components/DeleteBookingButton'
import DashboardStats from '@/components/DashboardStats'
import Link from 'next/link'

const TAG_COLORS: Record<string, string> = {
  'Индивидуальное': 'bg-purple-100 text-purple-700',
  'Группа': 'bg-blue-100 text-blue-700',
}

export default async function AdminDashboard() {
  const [bookings, lessons, students, posts] = await Promise.all([
    getBookings(),
    getLessons(),
    getStudents(),
    getAllPostsAdmin(),
  ])

  const newBookings = bookings.filter((b: any) => b.status === 'Новая')

  return (
    <div className="p-8 font-sans text-gray-800">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {posts.filter((p: any) => p.isPublished).length} статей · {students.length} учеников · {newBookings.length} новых заявок
        </p>
      </div>

      {/* Stats */}
      <DashboardStats bookings={bookings as any} lessons={lessons as any} students={students as any} />

      {/* Top row: Calendar + Bookings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Расписание занятий</h2>
          <LessonCalendar lessons={lessons as any} students={students} />
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Новые заявки</h2>
            {newBookings.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2.5 py-1 rounded-full">
                {newBookings.length} новых
              </span>
            )}
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Заявок пока нет</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="pb-2 pr-3 font-medium">Имя</th>
                    <th className="pb-2 pr-3 font-medium whitespace-nowrap">Возраст</th>
                    <th className="pb-2 pr-3 font-medium whitespace-nowrap">Телефон</th>
                    <th className="pb-2 pr-3 font-medium whitespace-nowrap">Дата</th>
                    <th className="pb-2 pr-3 font-medium">Статус</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="border-b border-gray-50">
                      <td className="py-3 pr-3 text-sm font-medium text-gray-800">{b.parentName}</td>
                      <td className="py-3 pr-3 text-sm text-gray-500 whitespace-nowrap">{b.childAge} лет</td>
                      <td className="py-3 pr-3 font-mono text-sm text-gray-600 whitespace-nowrap">{b.phone}</td>
                      <td className="py-3 pr-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 pr-3">
                        <form action={updateBookingStatus.bind(null, b.id, b.status === 'Новая' ? 'Обработана' : 'Новая')}>
                          <button className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap font-medium ${b.status === 'Новая' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {b.status}
                          </button>
                        </form>
                      </td>
                      <td className="py-3">
                        <DeleteBookingButton id={b.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Bottom: Students brief */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Мои ученики</h2>
          <Link href="/bigbos/students" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
            Все ученики →
          </Link>
        </div>
        {students.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Учеников пока нет.{' '}
            <Link href="/bigbos/students" className="text-purple-600 hover:underline">Добавить →</Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {students.slice(0, 8).map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/60 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[s.tag] ?? 'bg-gray-100 text-gray-500'}`}>
                    {s.tag}
                  </span>
                </div>
              </div>
            ))}
            {students.length > 8 && (
              <Link href="/bigbos/students" className="flex items-center justify-center p-3 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-300 hover:text-purple-600 transition-colors">
                +{students.length - 8} ещё
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
