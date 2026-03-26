import type { MetadataRoute } from 'next';

/**
 * Robots.txt configuration
 *
 * This file automatically generates /robots.txt for search engine crawlers.
 * It tells crawlers which pages they can and cannot access.
 *
 * @returns Robots configuration object
 *
 * Configuration:
 * - userAgent: '*' - applies to all search engine bots
 * - allow: '/' - allows crawling of all pages by default
 * - disallow: ['/api/', '/admin/'] - blocks crawling of API routes and admin pages
 * - sitemap: Points crawlers to the sitemap location
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://yoursite.com/sitemap.xml',
  };
}
