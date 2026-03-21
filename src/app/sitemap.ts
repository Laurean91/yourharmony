import type { MetadataRoute } from 'next'
import { getAllPublishedPostSlugs } from './actions'

const SITE_URL = 'https://yourharmony.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedPostSlugs()

  return [
    {
      url: SITE_URL,
      lastModified: posts[0]?.updatedAt ?? new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: posts[0]?.updatedAt ?? new Date(),
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
