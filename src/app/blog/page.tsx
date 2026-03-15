import type { Metadata } from 'next'
import Link from 'next/link'
import { getPosts } from '../actions'
import PostCard from '../../components/PostCard'

export const metadata: Metadata = {
  title: 'Блог | YourHarmony',
  description: 'Полезные статьи, новости клуба и советы для родителей от детского центра YourHarmony.',
  openGraph: {
    title: 'Блог | YourHarmony',
    description: 'Полезные статьи, новости клуба и советы для родителей.',
    type: 'website',
  },
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const { posts, totalPages } = await getPosts(currentPage)

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* Hero banner */}
      <section className="relative bg-gradient-to-br from-purple-700 to-indigo-600 text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-white rounded-full filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-purple-200 font-semibold uppercase tracking-widest text-sm mb-4">
            Блог
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Статьи и новости клуба
          </h1>
          <p className="text-purple-100 text-lg max-w-xl mx-auto">
            Советы для родителей, обзоры программ, рассказы о занятиях и жизни YourHarmony.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-8">
        {posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-6xl mb-6">📖</p>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Пока нет статей</h2>
            <p className="text-gray-400">Загляните позже — скоро здесь появятся материалы.</p>
            <Link
              href="/"
              className="mt-6 inline-block text-purple-600 font-semibold hover:underline"
            >
              ← На главную
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/blog?page=${p}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold text-sm transition-all ${
                      p === currentPage
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-gray-100 py-12 text-center">
        <Link
          href="/"
          className="text-purple-600 font-semibold hover:underline text-sm"
        >
          ← Вернуться на главную страницу
        </Link>
      </section>
    </main>
  )
}
