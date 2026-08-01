import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/**
 * Single-page site, so the sitemap is one entry. Section anchors are
 * deliberately omitted — Google treats `#fragment` URLs as the same document
 * and listing them adds noise without adding coverage.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
