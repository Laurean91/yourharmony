export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getBookings, getPhotos, updateBookingStatus, uploadPhoto, deletePhoto, getAllPostsAdmin } from '../actions'
import SignOutButton from '@/components/SignOutButton'
import DeleteBookingButton from '@/components/DeleteBookingButton'

export default async function AdminDashboard() {
  const [bookings, photos, posts] = await Promise.all([getBookings(), getPhotos(), getAllPostsAdmin()])

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Панель управления клуба</h1>
        <SignOutButton />
      </div>

      {/* Баннеры быстрого доступа */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* БЛОГ */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-sm text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Блог и Новости</h2>
            <p className="text-purple-100 text-sm">{posts.length} {posts.length === 1 ? 'статья' : 'статей'} · {posts.filter((p: any) => p.isPublished).length} опубликовано</p>
          </div>
          <Link href="/bigbos/blog" className="bg-white text-purple-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-colors text-sm whitespace-nowrap">
            Управление →
          </Link>
        </div>

        {/* УПРАВЛЕНИЕ САЙТОМ */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 rounded-2xl shadow-sm text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Управление сайтом</h2>
            <p className="text-teal-100 text-sm">Hero, контакты, CTA, FAQ, преподаватель...</p>
          </div>
          <Link href="/bigbos/landing" className="bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm whitespace-nowrap">
            Редактировать →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ЗАЯВКИ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Новые заявки</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-sm">
                  <th className="pb-2 pr-3 text-left">Имя</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Возраст</th>
                  <th className="pb-2 pr-3 text-left whitespace-nowrap">Телефон</th>
                  <th className="pb-2 pr-3 text-left">Статус</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-3 pr-3 text-sm">{b.parentName}</td>
                    <td className="py-3 pr-3 text-sm whitespace-nowrap">{b.childAge} лет</td>
                    <td className="py-3 pr-3 font-mono text-sm whitespace-nowrap">{b.phone}</td>
                    <td className="py-3 pr-3">
                      <form action={updateBookingStatus.bind(null, b.id, b.status === "Новая" ? "Обработана" : "Новая")}>
                        <button className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${b.status === 'Новая' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
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
        </div>

        {/* ГАЛЕРЕЯ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Управление галереей</h2>

          <form action={uploadPhoto} className="flex gap-2 mb-6">
            <input type="file" name="file" accept="image/*" required className="border p-2 rounded flex-1 text-sm bg-gray-50" />
            <button type="submit" className="bg-purple-600 text-white px-4 rounded font-medium hover:bg-purple-700">Загрузить</button>
          </form>

          <div className="grid grid-cols-3 gap-3">
            {photos.map((p: any) => (
              <div key={p.id} className="relative group rounded overflow-hidden aspect-square border">
                <img src={p.url} className="w-full h-full object-cover" alt="" />
                <form action={deletePhoto.bind(null, p.id, p.url)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">Удалить</button>
                </form>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
