export const dynamic = 'force-dynamic'

import {
  getBookings, getLessons, getStudents,
  getAllPostsAdmin, getFinanceStats,
} from '../actions'
import DashboardStats from '@/components/DashboardStats'
import DashboardChart from '@/components/DashboardChart'
import DashboardStudentGrid from '@/components/DashboardStudentGrid'
import UpcomingLessons from '@/components/UpcomingLessons'
import BookingRow from '@/components/BookingRow'
import Link from 'next/link'
import { ArrowUpRight, Bell } from 'lucide-react'

/* ─── tiny helpers ─────────────────────────────────────── */
function card() {
  return {
    background: 'var(--adm-bg-card)',
    border: '1px solid var(--adm-border-card)',
    boxShadow: 'var(--adm-shadow-card)',
  }
}

/* ─── page ─────────────────────────────────────────────── */
export default async function AdminDashboard() {
  const [bookings, lessons, students, , financeStats] = await Promise.all([
    getBookings(),
    getLessons(),
    getStudents(),
    getAllPostsAdmin(),
    getFinanceStats(),
  ])

  const newBookings = bookings.filter((b: any) => b.status === 'Новая')

  const mr = financeStats.monthlyRevenue
  const prevRevenue = mr.length >= 2
    ? (mr[mr.length - 2].individual + mr[mr.length - 2].group)
    : 0

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="p-6 md:p-8 font-sans" style={{ color: 'var(--adm-text-primary)' }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight" style={{ color: 'var(--adm-text-primary)' }}>Дашборд</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>{todayFormatted}</p>
        </div>
        {newBookings.length > 0 && (
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(90deg,rgba(249,115,22,.1),rgba(251,146,60,.08))',
              color: '#ea580c',
              border: '1px solid rgba(249,115,22,.2)',
            }}
          >
            <Bell size={14} />
            {newBookings.length} новых заявок
          </div>
        )}
      </div>

      {/* ── Row 1: KPI cards ── */}
      <DashboardStats
        bookings={bookings as any}
        lessons={lessons as any}
        students={students as any}
        monthRevenue={financeStats.totalThisMonth}
        prevRevenue={prevRevenue}
      />

      {/* ── Row 2: Chart (3/5) + Upcoming Lessons (2/5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        <div className="lg:col-span-3">
          <DashboardChart bookings={bookings as any} lessons={lessons as any} />
        </div>
        <div className="lg:col-span-2">
          <UpcomingLessons lessons={lessons as any} />
        </div>
      </div>

      {/* ── Row 3: Students (1/2) + Bookings (1/2) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

        {/* Students */}
        <div className="rounded-2xl p-6" style={card()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: 'var(--adm-text-primary)' }}>Мои ученики</h2>
            <Link
              href="/bigbos/students"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: '#7c3aed' }}
            >
              Все ученики <ArrowUpRight size={13} />
            </Link>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--adm-text-muted)' }}>
              Учеников пока нет.{' '}
              <Link href="/bigbos/students" className="font-semibold hover:underline" style={{ color: '#7c3aed' }}>
                Добавить →
              </Link>
            </p>
          ) : (
            <DashboardStudentGrid students={students as any} />
          )}
        </div>

        {/* Bookings table */}
        <div className="rounded-2xl overflow-hidden" style={card()}>
          <div
            className="flex items-center justify-between px-5 pt-5 pb-4"
            style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--adm-text-primary)' }}>Заявки</h2>
            {newBookings.length > 0 && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(249,115,22,.1)', color: '#ea580c' }}
              >
                {newBookings.length} новых
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-center py-10 px-5" style={{ color: 'var(--adm-text-muted)' }}>Заявок пока нет</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="text-[10px] uppercase tracking-wider"
                    style={{
                      color: '#9ca3af',
                      background: 'rgba(139,92,246,0.03)',
                      borderBottom: '1px solid rgba(139,92,246,0.08)',
                    }}
                  >
                    <th className="px-5 py-2.5 font-semibold">Родитель</th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Возраст</th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Телефон</th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Дата</th>
                    <th className="px-3 py-2.5 font-semibold">Статус</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b: any, idx: number) => (
                    <BookingRow key={b.id} b={b} idx={idx} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
