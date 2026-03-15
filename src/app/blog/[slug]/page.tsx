import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPostBySlug, getPosts } from '../../actions'

interface Props {
  params: Promise<{ slug: string }>
}

// Pre-generate paths for published posts at build time (ISR)
export async function generateStaticParams() {
  try {
    const { posts } = await getPosts(1)
    return posts.map((p) => ({ slug: p.slug }))
  } catch (error) {
    // If the database is unreachable during the build phase on Vercel,
    // gracefully fallback to an empty array. Pages will be generated on-demand at runtime.
    return []
  }
}

// Dynamic SEO metadata per article
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: 'Статья не найдена | YourHarmony' }
  }

  const description = post.excerpt ?? post.content.replace(/<[^>]+>/g, '').slice(0, 160)

  return {
    title: `${post.title} | Блог YourHarmony`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      ...(post.coverImage && { images: [{ url: post.coverImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  }
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(date)
  )

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || !post.isPublished) notFound()

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* Back navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 transition-colors font-medium"
        >
          ← Назад к блогу
        </Link>
      </div>

      {/* Article header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {post.category && (
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            {post.category.name}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-6">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-gray-100 pt-6">
          <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt)}</time>
          {post.updatedAt > post.createdAt && (
            <span>· Обновлено {formatDate(post.updatedAt)}</span>
          )}
        </div>
      </header>

      {/* Cover image */}
      {post.coverImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 mb-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </div>
      )}

      {/* Article body — styled with Tailwind Typography prose */}
      <article className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
        <div
          className="prose prose-lg prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md
            prose-blockquote:border-l-purple-400 prose-blockquote:text-gray-500
            prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:text-gray-100"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Footer navigation */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <Link href="/blog" className="text-purple-600 font-semibold hover:underline text-sm">
            ← Все статьи
          </Link>
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
            На главную
          </Link>
        </div>
      </footer>
    </main>
  )
}
