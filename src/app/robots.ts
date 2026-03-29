import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'anthropic-ai'],
        allow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'Googlebot-Extended',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/bigbos/', '/api/', '/api/auth/'],
      },
    ],
    sitemap: 'https://yourharmony-english.ru/sitemap.xml',
  }
}
