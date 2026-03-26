import type { MetadataRoute } from 'next';

/**
 * Sitemap configuration
 *
 * This file automatically generates /sitemap.xml for search engines.
 * It helps search engines discover and index all pages on your site more efficiently.
 *
 * @returns Array of sitemap entries with URL metadata
 *
 * Properties:
 * - url: The full URL of the page
 * - lastModified: When the page was last updated (helps search engines know when to re-crawl)
 * - changeFrequency: How often the page typically changes (always, hourly, daily, weekly, monthly, yearly, never)
 * - priority: Relative priority compared to other pages on your site (0.0 to 1.0, default 0.5)
 *
 * Usage:
 * 1. Update baseUrl to your actual domain
 * 2. Add entries for each public page on your site
 * 3. Higher priority for important pages (homepage: 1.0, main sections: 0.8, detail pages: 0.5-0.6)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yoursite.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Add more routes as your site grows
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // },
  ];
}
