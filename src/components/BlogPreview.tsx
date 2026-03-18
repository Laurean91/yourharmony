import Link from 'next/link'
import { getPosts } from '../app/actions'
import BlogCards from './BlogCards'

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

        <BlogCards posts={preview} />

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
