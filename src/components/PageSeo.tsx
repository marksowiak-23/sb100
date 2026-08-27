/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';

export interface PageSeoProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

/**
 * PageSeo Component
 * Dynamically manages document <head> meta tags, Open Graph properties,
 * Twitter cards, canonical links, and Schema.org JSON-LD structured data for search engines.
 */
export default function PageSeo({
  title,
  description,
  keywords = 'share your story, storytelling platform, life journeys, personal experiences, creative writing, connect with people, true stories, all ages storytelling, student stories, travel memoirs',
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&h=630&fit=crop',
  ogType = 'website',
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = 'summary_large_image',
  robots = 'index, follow',
  jsonLd
}: PageSeoProps) {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title.includes('StoryBook') ? title : `${title} | StoryBook`;
    document.title = formattedTitle;

    // Helper function to set or create a <meta> tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to set or create a <link> tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Standard Search Engine Meta Tags
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    setMetaTag('name', 'robots', robots);
    setMetaTag('name', 'author', 'StoryBook');

    // 3. Canonical URL
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const resolvedCanonical = canonicalUrl || currentUrl;
    if (resolvedCanonical) {
      setLinkTag('canonical', resolvedCanonical);
    }

    // 4. Open Graph (OG) Social Meta Tags
    setMetaTag('property', 'og:site_name', 'StoryBook');
    setMetaTag('property', 'og:title', ogTitle || formattedTitle);
    setMetaTag('property', 'og:description', ogDescription || description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', ogUrl || resolvedCanonical);
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
    }

    // 5. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:title', twitterTitle || ogTitle || formattedTitle);
    setMetaTag('name', 'twitter:description', twitterDescription || ogDescription || description);
    if (twitterImage || ogImage) {
      setMetaTag('name', 'twitter:image', twitterImage || ogImage);
    }

    // 6. Schema.org JSON-LD Structured Data
    const scriptId = 'storybook-page-json-ld';
    let jsonLdScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = scriptId;
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      // Remove previous JSON-LD if none is provided for this view
      jsonLdScript.remove();
    }

    return () => {
      // Optional cleanup on unmount if needed
    };
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    ogUrl,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard,
    robots,
    jsonLd
  ]);

  return null;
}
