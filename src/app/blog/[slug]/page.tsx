import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPostBySlug, getPosts } from '../../actions'
import sanitizeHtml from 'sanitize-html'
import BookingButton from '../../../components/BookingButton'
import { formatDate } from '../../../lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { posts } = await getPosts(1)
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return { title: 'Статья не найдена | YourHarmony' }

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


export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || !post.isPublished) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800">

      {/* ── HERO шапка статьи ── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 text-center">
        {/* Blob декорации */}
        <div className="absolute top-[-8rem] left-[-8rem] w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob pointer-events-none" />
        <div className="absolute top-[-8rem] right-[-8rem] w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          {/* Навигация */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors mb-8"
          >
            ← Все статьи
          </Link>

          {/* Категория */}
          {post.category && (
            <div className="mb-4">
              <span className="inline-block bg-gradient-to-r from-purple-500 to-orange-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                {post.category.name}
              </span>
            </div>
          )}

          {/* Заголовок */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Мета */}
          <div className="flex items-center justify-center gap-3 text-sm text-gray-400 font-medium">
            <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt)}</time>
            {post.updatedAt > post.createdAt && (
              <>
                <span>·</span>
                <span>Обновлено {formatDate(post.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Обложка ── */}
      {post.coverImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-4 mb-4">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl border border-white/60">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        </div>
      )}

      {/* ── Тело статьи ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        {/* Стеклянная карточка с контентом */}
        <div className="bg-white/50 backdrop-blur-lg border border-white/60 rounded-3xl shadow-[0_8px_40px_0_rgba(31,38,135,0.1)] p-8 sm:p-12">
          <div
            className="prose prose-lg prose-gray max-w-none
              prose-headings:font-extrabold prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-purple-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto
              prose-blockquote:border-l-4 prose-blockquote:border-purple-400
              prose-blockquote:bg-purple-50/60 prose-blockquote:rounded-r-xl
              prose-blockquote:px-6 prose-blockquote:py-3 prose-blockquote:not-italic
              prose-blockquote:text-gray-600
              prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-2xl
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-700"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(post.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ['src', 'alt', 'width', 'height', 'class'],
                  '*': ['class'],
                },
              }),
            }}
          />
        </div>

        {/* ── Навигация в конце ── */}
        <div className="mt-12 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl font-semibold text-purple-600 hover:bg-white/80 transition-all shadow-sm text-sm"
          >
            ← Все статьи
          </Link>
          <BookingButton className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-2xl font-semibold hover:brightness-110 transition-all shadow-md text-sm">
            Записаться на занятие →
          </BookingButton>
        </div>
      </main>

      {/* ── Декоративный footer ── */}
      <div className="relative overflow-hidden py-12 mt-4">
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Клуб «Гармония» ·英语为孩子
          </Link>
        </div>
      </div>
    </div>
  )
}
