import type { Metadata } from 'next';

/**
 * Site-wide metadata configuration
 *
 * This file centralizes all SEO and social media metadata for your application.
 * Update these values to match your actual site information.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */

const siteConfig = {
  /** Site name (short version) - used in page titles and social cards */
  name: 'NextPier',

  /** Full site title - appears in browser tabs and search results */
  title: 'NextPier | Next.js 工作台与 Wails 桌面模板',

  /** Site description - appears in search results and social cards (150-160 characters recommended) */
  description:
    '面向工作台的 Next.js 模板，内置 AnimateIcons、Cult UI 和紧凑样式。通过 CLI 接入 Wails 桌面应用与 Browser Harness AI 对话，保留 Server Actions。',

  /** Your site's production URL (no trailing slash) */
  url: 'https://yoursite.com',

  /** External links */
  links: {
    github: 'https://github.com/yayapao/nextpier',
  },
};

export const defaultMetadata: Metadata = {
  /**
   * Page title configuration
   * - default: The default title for pages without a specific title
   * - template: Pattern for page titles (%s is replaced with the page-specific title)
   *   Example: "About | NextPier"
   */
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },

  /** Meta description for SEO */
  description: siteConfig.description,

  /** Keywords for SEO - helps search engines understand your content */
  keywords: [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Shadcn UI',
    'Wails',
    'AnimateIcons',
    'Cult UI',
    'Desktop Apps',
    'Workbench',
    'Browser Harness',
  ],

  /** Site author information */
  authors: [
    {
      name: 'yayapao',
      url: 'https://github.com/yayapao',
    },
  ],

  /** Content creator name */
  creator: 'yayapao',

  /** Base URL for all relative URLs in metadata */
  metadataBase: new URL(siteConfig.url),

  /**
   * Open Graph metadata - controls how content appears when shared on social platforms
   * (Facebook, LinkedIn, WhatsApp, etc.)
   * @see https://ogp.me/
   */
  openGraph: {
    type: 'website', // Type of content (website, article, video, etc.)
    locale: 'zh_CN', // Language and region
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },

  /**
   * Twitter Card metadata - controls how content appears when shared on Twitter/X
   * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
   */
  twitter: {
    card: 'summary_large_image', // Card type (summary, summary_large_image, player, app)
    title: siteConfig.title,
    description: siteConfig.description,
  },

  /** Favicon and app icon configuration */
  icons: {
    icon: '/favicon.ico', // Standard favicon
  },
};

export { siteConfig };
