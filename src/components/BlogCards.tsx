'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatDate } from '../lib/utils'

type Post = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  createdAt: Date
  category: { name: string } | null
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function BlogCards({ posts }: { posts: Post[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={fadeUp}>
          <Link
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
                {formatDate(post.createdAt, false)}
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
        </motion.div>
      ))}
    </motion.div>
  )
}
