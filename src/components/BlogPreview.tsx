import Link from 'next/link'
import Image from 'next/image'
import { getPosts } from '../app/actions'

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(date))

export default async function BlogPreview() {
  const { posts } = await getPosts(1)
  const preview = posts.slice(0, 3)

  if (preview.length === 0) return null

  return (
    <section className="py-24 px-4 bg-white/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-2">
              Блог
            </p>
            <h2 className="text-4xl font-extrabold text-gray-800">
              Последние статьи
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
          >
            Все статьи
            <span>→</span>
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preview.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              {/* Cover */}
              <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    📝
                  </div>
                )}
                {post.category && (
                  <span className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {post.category.name}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <time className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                  {formatDate(post.createdAt)}
                </time>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-4 text-sm font-semibold text-purple-600 flex items-center gap-1">
                  Читать
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Все статьи
          </Link>
        </div>
      </div>
    </section>
  )
}
