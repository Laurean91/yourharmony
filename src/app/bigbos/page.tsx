export const dynamic = 'force-dynamic'

import {
  getBookings, getLessons, getStudents,
  getAllPostsAdmin, updateBookingStatus, getFinanceStats,
} from '../actions'
import LessonCalendar from '@/components/LessonCalendar'
import DeleteBookingButton from '@/components/DeleteBookingButton'
import DashboardStats from '@/components/DashboardStats'
import DashboardStudentGrid from '@/components/DashboardStudentGrid'
import Link from 'next/link'
import { TrendingUp, ArrowUpRight, Bell } from 'lucide-react'

/* ── helpers ── */
function cardStyle(opts?: { accent?: boolean }) {
  return {
    background: '#fff',
    border: '1px solid rgba(139,92,246,0.12)',
    boxShadow: opts?.accent
      ? '0 2px 20px rgba(109,40,217,0.08)'
      : '0 1px 10px rgba(109,40,217,0.04)',
  }
}

function linkStyle() {
  return { color: '#7c3aed' }
}

export default async function AdminDashboard() {
  const [bookings, lessons, students, posts, financeStats] = await Promise.all([
    getBookings(),
    getLessons(),
    getStudents(),
    getAllPostsAdmin(),
    getFinanceStats(),
  ])

  const newBookings = bookings.filter((b: any) => b.status === 'Новая')

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="p-6 md:p-8 font-sans text-gray-800">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Дашборд</h1>
          <p className="text-sm text-gray-400 mt-0.5">{todayFormatted}</p>
        </div>

        {newBookings.length > 0 && (
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(90deg, rgba(249,115,22,0.1) 0%, rgba(251,146,60,0.08) 100%)',
              color: '#ea580c',
              border: '1px solid rgba(249,115,22,0.2)',
            }}
          >
            <Bell size={14} />
            {newBookings.length} новых заявок
          </div>
        )}
      </div>

      {/* ── Stats + chart ── */}
      <DashboardStats bookings={bookings as any} lessons={lessons as any} students={students as any} />

      {/* ── Finance mini-block ── */}
      <div className="rounded-2xl p-6 mb-5" style={cardStyle({ accent: true })}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.1)' }}
            >
              <TrendingUp size={17} style={{ color: '#7c3aed' }} />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Финансы</h2>
          </div>
          <Link
            href="/bigbos/finance"
            className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
            style={linkStyle()}
          >
            Аналитика <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div>
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Доход в этом месяце</p>
            <p className="text-4xl font-extrabold" style={{ color: '#7c3aed' }}>
              {financeStats.totalThisMonth.toLocaleString('ru-RU')}{' '}
              <span className="text-2xl">₽</span>
            </p>
          </div>

          <div className="flex gap-5 pb-1">
            <div
              className="px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}
            >
              <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Индивидуальные</p>
              <p className="text-lg font-bold text-gray-800">
                {financeStats.totalIndividual.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div
              className="px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)' }}
            >
              <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Групповые</p>
              <p className="text-lg font-bold text-gray-800">
                {financeStats.totalGroup.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Calendar + Bookings ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

        {/* Calendar */}
        <div className="rounded-2xl p-6" style={cardStyle()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Расписание занятий</h2>
            <Link
              href="/bigbos/schedule"
              className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
              style={linkStyle()}
            >
              Расписание <ArrowUpRight size={13} />
            </Link>
          </div>
          <LessonCalendar lessons={lessons as any} students={students} readonly />
        </div>

        {/* Bookings */}
        <div className="rounded-2xl p-6" style={cardStyle()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Новые заявки</h2>
            {newBookings.length > 0 && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(249,115,22,0.1)', color: '#ea580c' }}
              >
                {newBookings.length} новых
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Заявок пока нет</p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: '#9ca3af', borderBottom: '1px solid rgba(139,92,246,0.08)' }}
                  >
                    <th className="pb-2.5 pr-3 font-semibold">Имя</th>
                    <th className="pb-2.5 pr-3 font-semibold whitespace-nowrap">Возраст</th>
                    <th className="pb-2.5 pr-3 font-semibold whitespace-nowrap">Телефон</th>
                    <th className="pb-2.5 pr-3 font-semibold whitespace-nowrap">Дата</th>
                    <th className="pb-2.5 pr-3 font-semibold">Статус</th>
                    <th className="pb-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b: any) => (
                    <tr
                      key={b.id}
                      style={{ borderBottom: '1px solid rgba(139,92,246,0.06)' }}
                    >
                      <td className="py-3 pr-3 text-sm font-semibold text-gray-800">{b.parentName}</td>
                      <td className="py-3 pr-3 text-sm text-gray-500 whitespace-nowrap">{b.childAge} л.</td>
                      <td className="py-3 pr-3 font-mono text-xs text-gray-600 whitespace-nowrap">{b.phone}</td>
                      <td className="py-3 pr-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric', month: 'short',
                        })}
                      </td>
                      <td className="py-3 pr-3">
                        <form action={updateBookingStatus.bind(null, b.id, b.status === 'Новая' ? 'Обработана' : 'Новая')}>
                          <button
                            className="px-2.5 py-1 text-xs rounded-full whitespace-nowrap font-semibold transition-opacity hover:opacity-80"
                            style={
                              b.status === 'Новая'
                                ? { background: 'rgba(249,115,22,0.1)', color: '#ea580c' }
                                : { background: 'rgba(34,197,94,0.1)', color: '#16a34a' }
                            }
                          >
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

      {/* ── Students ── */}
      <div className="rounded-2xl p-6" style={cardStyle()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Мои ученики</h2>
          <Link
            href="/bigbos/students"
            className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
            style={linkStyle()}
          >
            Все ученики <ArrowUpRight size={13} />
          </Link>
        </div>
        {students.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Учеников пока нет.{' '}
            <Link href="/bigbos/students" className="font-semibold hover:underline" style={linkStyle()}>
              Добавить →
            </Link>
          </p>
        ) : (
          <DashboardStudentGrid students={students as any} />
        )}
      </div>

    </div>
  )
}
