import type { MetadataRoute } from 'next'
import { getAllPublishedPostSlugs } from './actions'

export const revalidate = 3600

const SITE_URL = 'https://yourharmony-english.ru'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Awaited<ReturnType<typeof getAllPublishedPostSlugs>> = []
  try {
    posts = await getAllPublishedPostSlugs()
  } catch {
    // DB unavailable (e.g. during build)
  }

  return [
    {
      url: SITE_URL,
      lastModified: new Date('2026-03-23'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/teacher`,
      lastModified: new Date('2026-03-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: posts[0]?.updatedAt ?? new Date('2026-03-23'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
