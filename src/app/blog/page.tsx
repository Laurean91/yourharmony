import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPosts } from '../actions'
import BookingButton from '../../components/BookingButton'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { formatDate } from '../../lib/utils'

export const revalidate = 60

const SITE_URL = 'https://yourharmony-english.ru'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const canonical = currentPage > 1
    ? `${SITE_URL}/blog?page=${currentPage}`
    : `${SITE_URL}/blog`

  return {
    title: 'Блог',
    description: 'Полезные статьи, новости клуба и советы для родителей от детского языкового клуба «Гармония».',
    alternates: { canonical },
    openGraph: {
      title: 'Блог | Клуб «Гармония»',
      description: 'Полезные статьи, новости клуба и советы для родителей.',
      url: canonical,
      siteName: 'Клуб «Гармония»',
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Блог | Клуб «Гармония»' }],
    },
  }
}


export default async function BlogPage({ searchParams }: Props) {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const { posts, totalPages } = await getPosts(currentPage)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Блог', item: `${SITE_URL}/blog` },
    ],
  }

  const itemListSchema = posts.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Блог клуба «Гармония»',
    description: 'Полезные статьи, новости клуба и советы для родителей.',
    url: `${SITE_URL}/blog`,
    itemListElement: posts.map((post, i) => ({
      '@type': 'ListItem',
      position: (currentPage - 1) * 6 + i + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
    })),
  } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />}
      <Navbar />

      {/* ── Hero шапка ── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 text-center">
        {/* Blob декорации */}
        <div className="absolute top-[-8rem] left-[-8rem] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob pointer-events-none" />
        <div className="absolute top-[-8rem] right-[-8rem] w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors mb-8"
          >
            ← На главную
          </Link>

          <p className="text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500 mb-4">
            Блог
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 mb-5 leading-tight">
            Статьи и новости
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Советы для родителей, обзоры программ и рассказы о жизни клуба «Гармония».
          </p>
        </div>
      </section>

      {/* ── Сетка статей ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/50 backdrop-blur-lg border border-white/60 shadow-lg text-5xl mb-6">
              📖
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Пока нет статей</h2>
            <p className="text-gray-400 mb-8">Загляните позже — скоро здесь появятся материалы.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:brightness-110 transition-all"
            >
              ← На главную
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white/50 backdrop-blur-lg border border-white/60 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] hover:-translate-y-2 hover:shadow-[0_16px_40px_0_rgba(31,38,135,0.14)] transition-all duration-300"
                >
                  {/* Обложка */}
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl">
                        📝
                      </div>
                    )}
                    {/* Категория */}
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  {/* Контент */}
                  <div className="flex flex-col flex-1 p-6">
                    <time className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                      {formatDate(post.createdAt, false)}
                    </time>
                    <h2 className="text-lg font-extrabold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-orange-500 transition-all line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-5 flex items-center gap-1 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">
                      Читать далее
                      <span className="text-orange-500 group-hover:translate-x-1.5 transition-transform inline-block">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/blog?page=${p}`}
                    className={`w-11 h-11 flex items-center justify-center rounded-2xl font-bold text-sm transition-all ${
                      p === currentPage
                        ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-lg scale-110'
                        : 'bg-white/60 backdrop-blur-sm border border-white/60 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:-translate-y-0.5 shadow-sm'
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

      {/* ── CTA внизу ── */}
      <section className="relative overflow-hidden py-16 px-4 text-center">
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />
        <div className="relative max-w-xl mx-auto">
          <p className="text-gray-500 mb-5 text-sm">Хотите отдать ребёнка в наш клуб?</p>
          <BookingButton className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:brightness-110 transition-all">
            Записаться на занятие
          </BookingButton>
        </div>
      </section>

      <Footer />
    </div>
  )
}
