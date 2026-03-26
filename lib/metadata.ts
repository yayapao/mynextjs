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
  name: 'mynextjs',

  /** Full site title - appears in browser tabs and search results */
  title: 'mynextjs - Modern Next.js Starter',

  /** Site description - appears in search results and social cards (150-160 characters recommended) */
  description:
    'A modern Next.js starter template built with the latest features and best practices for scalable web applications.',

  /** Your site's production URL (no trailing slash) */
  url: 'https://yoursite.com',

  /** Open Graph image URL - shown when sharing on social media (1200x630px recommended) */
  ogImage: 'https://yoursite.com/og.jpg',

  /** External links */
  links: {
    twitter: 'https://twitter.com/yourusername',
    github: 'https://github.com/yourusername/mynextjs',
  },
};

export const defaultMetadata: Metadata = {
  /**
   * Page title configuration
   * - default: The default title for pages without a specific title
   * - template: Pattern for page titles (%s is replaced with the page-specific title)
   *   Example: "About | mynextjs"
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
    'Web Development',
  ],

  /** Site author information */
  authors: [
    {
      name: 'Your Name',
      url: siteConfig.url,
    },
  ],

  /** Content creator name */
  creator: 'Your Name',

  /** Base URL for all relative URLs in metadata */
  metadataBase: new URL(siteConfig.url),

  /**
   * Open Graph metadata - controls how content appears when shared on social platforms
   * (Facebook, LinkedIn, WhatsApp, etc.)
   * @see https://ogp.me/
   */
  openGraph: {
    type: 'website', // Type of content (website, article, video, etc.)
    locale: 'en_US', // Language and region
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200, // Recommended dimensions for social sharing
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },

  /**
   * Twitter Card metadata - controls how content appears when shared on Twitter/X
   * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
   */
  twitter: {
    card: 'summary_large_image', // Card type (summary, summary_large_image, player, app)
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@yourusername', // Your Twitter handle
  },

  /** Favicon and app icon configuration */
  icons: {
    icon: '/favicon.ico', // Standard favicon
    shortcut: '/favicon-16x16.png', // Shortcut icon (browser tabs)
    apple: '/apple-touch-icon.png', // Apple touch icon (iOS home screen)
  },

  /** Web app manifest - enables PWA features and customizes how the app appears when installed */
  manifest: '/site.webmanifest',
};

export { siteConfig };
