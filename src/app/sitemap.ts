import type { MetadataRoute } from 'next'

const SITEMAP_LIMIT = 50000; // Google's limit for URLs per sitemap

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.medohhealth.com',
      lastModified: new Date(),
      changeFrequency: 'weekly'
    },
    {
      url: 'https://www.medohhealth.com/dashboard/home',
      lastModified: new Date(),
      changeFrequency: 'weekly'
      
    },
    {
      url: 'https://www.medohhealth.com/dashboard/search',
      lastModified: new Date(),
      changeFrequency: 'weekly'
    },
    {
      url: 'https://www.medohhealth.com/dashboard/doctors',
      lastModified: new Date(),
      changeFrequency: 'weekly'
    },

  ]
}