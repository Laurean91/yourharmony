export const dynamic = 'force-dynamic'

import {
  getBookings, getLessons, getStudents,
  getAllPostsAdmin, getFinanceStats,
} from '../actions'
import DashboardStats from '@/components/DashboardStats'
import DashboardStudentGrid from '@/components/DashboardStudentGrid'
import UpcomingLessons from '@/components/UpcomingLessons'
import BookingRow from '@/components/BookingRow'
import Link from 'next/link'
import { TrendingUp, ArrowUpRight, Bell } from 'lucide-react'

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
  const [bookings, lessons, students, posts, financeStats] = await Promise.all([
    getBookings(),
    getLessons(),
    getStudents(),
    getAllPostsAdmin(),
    getFinanceStats(),
  ])

  const newBookings = bookings.filter((b: any) => b.status === 'Новая')

  // Previous month revenue from monthlyRevenue array
  const mr = financeStats.monthlyRevenue
  const prevRevenue = mr.length >= 2
    ? (mr[mr.length - 2].individual + mr[mr.length - 2].group)
    : 0

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="p-6 md:p-8 font-sans text-gray-800">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Дашборд</h1>
          <p className="text-sm text-gray-400 mt-0.5">{todayFormatted}</p>
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

      {/* ── KPI + Area chart ── */}
      <DashboardStats
        bookings={bookings as any}
        lessons={lessons as any}
        students={students as any}
        monthRevenue={financeStats.totalThisMonth}
        prevRevenue={prevRevenue}
      />

      {/* ── Finance + Students grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Finance quick block */}
        <div className="rounded-2xl p-6" style={card()}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,.1)' }}
              >
                <TrendingUp size={17} style={{ color: '#7c3aed' }} />
              </div>
              <h2 className="text-base font-semibold text-gray-800">Финансы</h2>
            </div>
            <Link
              href="/bigbos/finance"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: '#7c3aed' }}
            >
              Аналитика <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Доход в этом месяце</p>
              <p className="text-4xl font-extrabold" style={{ color: '#7c3aed' }}>
                {financeStats.totalThisMonth.toLocaleString('ru-RU')}{' '}
                <span className="text-2xl">₽</span>
              </p>
            </div>
            <div className="flex gap-3">
              <div
                className="flex-1 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(124,58,237,.06)', border: '1px solid rgba(124,58,237,.1)' }}
              >
                <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Индивидуальные</p>
                <p className="text-lg font-bold text-gray-800">
                  {financeStats.totalIndividual.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div
                className="flex-1 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.12)' }}
              >
                <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Групповые</p>
                <p className="text-lg font-bold text-gray-800">
                  {financeStats.totalGroup.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="rounded-2xl p-6" style={card()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Мои ученики</h2>
            <Link
              href="/bigbos/students"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: '#7c3aed' }}
            >
              Все ученики <ArrowUpRight size={13} />
            </Link>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Учеников пока нет.{' '}
              <Link href="/bigbos/students" className="font-semibold hover:underline" style={{ color: '#7c3aed' }}>
                Добавить →
              </Link>
            </p>
          ) : (
            <DashboardStudentGrid students={students as any} />
          )}
        </div>
      </div>

      {/* ── Upcoming lessons + Bookings ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

        {/* Upcoming lessons */}
        <UpcomingLessons lessons={lessons as any} />

        {/* Bookings table */}
        <div className="rounded-2xl overflow-hidden" style={card()}>
          <div
            className="flex items-center justify-between px-5 pt-5 pb-4"
            style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}
          >
            <h2 className="text-base font-semibold text-gray-800">Заявки</h2>
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
            <p className="text-sm text-gray-400 text-center py-10 px-5">Заявок пока нет</p>
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

/* BookingRow → src/components/BookingRow.tsx ('use client') */
