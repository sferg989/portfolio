import type { SeoMetadata } from '../types/seo';
import { seoConfig } from './seo_config';

export class SeoService {
  /**
   * Merges provided SEO metadata with defaults
   */
  static mergeSeoData(metadata: Partial<SeoMetadata> = {}): SeoMetadata {
    const fullImageUrl = metadata.image 
      ? (metadata.image.startsWith('http') ? metadata.image : `${seoConfig.siteUrl}${metadata.image}`)
      : `${seoConfig.siteUrl}${seoConfig.defaultImage}`;

    const canonicalUrl = metadata.canonicalUrl || `${seoConfig.siteUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`;

    return {
      title: metadata.title || seoConfig.defaultTitle,
      description: metadata.description || seoConfig.defaultDescription,
      keywords: metadata.keywords || seoConfig.defaultKeywords,
      image: fullImageUrl,
      imageAlt: metadata.imageAlt || seoConfig.defaultImageAlt,
      canonicalUrl,
      type: metadata.type || 'website',
      author: metadata.author || seoConfig.defaultAuthor,
      publishedTime: metadata.publishedTime,
      modifiedTime: metadata.modifiedTime,
      schema: metadata.schema
    };
  }

  /**
   * Validates SEO metadata
   */
  static validateSeoData(metadata: SeoMetadata): string[] {
    const errors: string[] = [];

    if (!metadata.title || metadata.title.length < 10) {
      errors.push('Title should be at least 10 characters long');
    }

    if (!metadata.description || metadata.description.length < 50) {
      errors.push('Description should be at least 50 characters long');
    }

    if (metadata.title && metadata.title.length > 60) {
      errors.push('Title should be less than 60 characters for optimal SEO');
    }

    if (metadata.description && metadata.description.length > 160) {
      errors.push('Description should be less than 160 characters for optimal SEO');
    }

    return errors;
  }

  /**
   * Generates page-specific title with site name
   */
  static generatePageTitle(pageTitle: string, includeSiteName = true): string {
    if (!includeSiteName) return pageTitle;
    return `${pageTitle} | ${seoConfig.siteName}`;
  }

  /**
   * Extracts keywords from content (basic implementation)
   */
  static extractKeywords(content: string, baseKeywords: string = ''): string {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));

    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return baseKeywords ? `${baseKeywords}, ${topWords.join(', ')}` : topWords.join(', ');
  }
} 