import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/'
    },
    sitemap: ['https://www.medohhealth.com/sitemap.xml', 'https://www.medohhealth.com/dashboard/question/sitemap']
  }
}