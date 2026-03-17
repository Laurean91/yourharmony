import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '../lib/utils'

interface PostCardProps {
  post: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    coverImage: string | null
    createdAt: Date
    category: { name: string; slug: string } | null
  }
}


export default function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover image */}
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">📝</span>
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
        <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
        )}
        <span className="mt-4 text-sm font-semibold text-purple-600 flex items-center gap-1">
          Читать далее
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
    </Link>
  )
}
