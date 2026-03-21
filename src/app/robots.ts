import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Googlebot'],
        allow: '/',
      },
      {
        userAgent: ['CCBot', 'anthropic-ai'],
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/bigbos/', '/api/'],
      },
    ],
    sitemap: 'https://yourharmony.vercel.app/sitemap.xml',
  }
}
