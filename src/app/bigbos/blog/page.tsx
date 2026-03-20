export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getAllPostsAdmin, togglePostStatus, getCategories } from '../../actions'
import { Pencil, Eye, EyeOff, PlusCircle } from 'lucide-react'
import DeletePostButton from '../../../components/DeletePostButton'

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(date))

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([getAllPostsAdmin(), getCategories()])

  return (
    <div className="p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Блог и новости</h1>
            <p className="text-gray-500 mt-1">{posts.length} {posts.length === 1 ? 'статья' : 'статей'} · {categories.length} категорий</p>
          </div>
          <Link
            href="/bigbos/blog/new"
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm"
          >
            <PlusCircle size={18} />
            Новая статья
          </Link>
        </div>

        {/* Posts table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-lg font-medium">Статей пока нет</p>
              <p className="text-sm mt-1">
                <Link href="/bigbos/blog/new" className="text-purple-600 hover:underline">
                  Создайте первую статью →
                </Link>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 font-semibold text-gray-600">Заголовок</th>
                    <th className="px-4 py-4 font-semibold text-gray-600">Категория</th>
                    <th className="px-4 py-4 font-semibold text-gray-600">Статус</th>
                    <th className="px-4 py-4 font-semibold text-gray-600">Дата</th>
                    <th className="px-4 py-4 font-semibold text-gray-600 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">/blog/{post.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {post.category ? (
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                            {post.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <form action={togglePostStatus.bind(null, post.id, post.isPublished)}>
                          <button
                            type="submit"
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                              post.isPublished
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            {post.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                            {post.isPublished ? 'Опубликовано' : 'Черновик'}
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/bigbos/blog/${post.id}/edit`}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <Pencil size={16} />
                          </Link>
                          <DeletePostButton id={post.id} title={post.title} />
                          {post.isPublished && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Открыть на сайте"
                            >
                              <Eye size={16} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
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
