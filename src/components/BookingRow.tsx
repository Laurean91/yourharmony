'use client'

import { updateBookingStatus } from '@/app/actions'
import DeleteBookingButton from './DeleteBookingButton'

function relativeDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7)  return `${diffDays} дн. назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export default function BookingRow({ b, idx }: { b: any; idx: number }) {
  const isNew = b.status === 'Новая'
  const isZebra = idx % 2 === 1

  return (
    <tr
      style={{
        background: isZebra ? 'rgba(139,92,246,0.025)' : '#fff',
        borderBottom: '1px solid rgba(139,92,246,0.06)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(139,92,246,0.06)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLTableRowElement).style.background =
          isZebra ? 'rgba(139,92,246,0.025)' : '#fff'
      }}
    >
      {/* Name + avatar */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}
          >
            {b.parentName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{b.parentName}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{b.childAge} л.</td>
      <td className="px-3 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{b.phone}</td>
      <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">{relativeDate(b.createdAt)}</td>
      <td className="px-3 py-3">
        <form action={updateBookingStatus.bind(null, b.id, isNew ? 'Обработана' : 'Новая')}>
          <button
            className="px-2.5 py-1 text-xs rounded-full whitespace-nowrap font-semibold hover:opacity-70 transition-opacity"
            style={
              isNew
                ? { background: 'rgba(249,115,22,.1)', color: '#ea580c' }
                : { background: 'rgba(34,197,94,.1)',  color: '#16a34a' }
            }
          >
            {b.status}
          </button>
        </form>
      </td>
      <td className="px-3 py-3">
        <DeleteBookingButton id={b.id} />
      </td>
    </tr>
  )
}
