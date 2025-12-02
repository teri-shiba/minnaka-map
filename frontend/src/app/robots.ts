import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_FRONT_BASE_URL!

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/favorites', '/settings', '/result'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
