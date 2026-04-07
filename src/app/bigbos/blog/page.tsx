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
    <div className="p-8 font-sans" style={{ color: 'var(--adm-text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--adm-text-primary)' }}>Блог и новости</h1>
            <p className="mt-1" style={{ color: 'var(--adm-text-muted)' }}>{posts.length} {posts.length === 1 ? 'статья' : 'статей'} · {categories.length} категорий</p>
          </div>
          <Link
            href="/bigbos/blog/new"
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm text-sm"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Новая статья</span>
            <span className="sm:hidden">Создать</span>
          </Link>
        </div>

        {/* Posts table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--adm-bg-card)',
            border: '1px solid var(--adm-border-card)',
          }}
        >
          {posts.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--adm-text-muted)' }}>
              <p className="text-5xl mb-4">📝</p>
              <p className="text-lg font-medium">Статей пока нет</p>
              <p className="text-sm mt-1">
                <Link href="/bigbos/blog/new" className="font-semibold hover:underline" style={{ color: '#7c3aed' }}>
                  Создайте первую статью →
                </Link>
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="sm:hidden" style={{ borderColor: 'var(--adm-border-sep)' }}>
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 space-y-3"
                    style={{
                      borderBottom: '1px solid var(--adm-border-sep)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium leading-snug" style={{ color: 'var(--adm-text-primary)' }}>{post.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>/blog/{post.slug}</p>
                      </div>
                      {post.category && (
                        <span className="shrink-0 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(79,70,229,0.1)' }}>
                          {post.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <form action={togglePostStatus.bind(null, post.id, post.isPublished)}>
                          <button
                            type="submit"
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                              post.isPublished
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {post.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                            {post.isPublished ? 'Опубликовано' : 'Черновик'}
                          </button>
                        </form>
                        <span className="text-xs" style={{ color: 'var(--adm-text-muted)' }}>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/bigbos/blog/${post.id}/edit`}
                          className="p-2 rounded-lg transition-colors hover:opacity-70"
                          style={{ color: 'var(--adm-text-muted)' }}
                        >
                          <Pencil size={16} />
                        </Link>
                        <DeletePostButton id={post.id} title={post.title} />
                        {post.isPublished && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg transition-colors hover:opacity-70"
                            style={{ color: 'var(--adm-text-muted)' }}
                          >
                            <Eye size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--adm-border-sep)',
                        background: 'var(--adm-bg-thead)',
                      }}
                    >
                      <th className="px-6 py-4 font-semibold" style={{ color: 'var(--adm-text-secondary)' }}>Заголовок</th>
                      <th className="px-4 py-4 font-semibold" style={{ color: 'var(--adm-text-secondary)' }}>Категория</th>
                      <th className="px-4 py-4 font-semibold" style={{ color: 'var(--adm-text-secondary)' }}>Статус</th>
                      <th className="px-4 py-4 font-semibold" style={{ color: 'var(--adm-text-secondary)' }}>Дата</th>
                      <th className="px-4 py-4 font-semibold text-right" style={{ color: 'var(--adm-text-secondary)' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post, idx) => (
                      <tr
                        key={post.id}
                        className="transition-colors hover:opacity-70"
                        style={{
                          borderBottom: '1px solid var(--adm-border-sep)',
                          background: idx % 2 === 1 ? 'var(--adm-bg-zebra)' : 'transparent',
                        }}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium line-clamp-1" style={{ color: 'var(--adm-text-primary)' }}>{post.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>/blog/{post.slug}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {post.category ? (
                            <span className="text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(79,70,229,0.1)' }}>
                              {post.category.name}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--adm-text-muted)' }}>—</span>
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
                        <td className="px-4 py-4 text-xs whitespace-nowrap" style={{ color: 'var(--adm-text-muted)' }}>
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/bigbos/blog/${post.id}/edit`}
                              className="p-2 rounded-lg transition-colors hover:opacity-70"
                              style={{ color: 'var(--adm-text-muted)' }}
                              title="Редактировать"
                            >
                              <Pencil size={16} />
                            </Link>
                            <DeletePostButton id={post.id} title={post.title} />
                            {post.isPublished && (
                              <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                className="p-2 rounded-lg transition-colors hover:opacity-70"
                                style={{ color: 'var(--adm-text-muted)' }}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
