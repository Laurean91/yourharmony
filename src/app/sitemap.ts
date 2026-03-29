import type { MetadataRoute } from 'next'
import { getAllPublishedPostSlugs } from './actions'
import { SITE_URL } from '../lib/config'

export const revalidate = 300

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
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/teacher`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: posts[0]?.updatedAt ?? new Date(),
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ]
}
