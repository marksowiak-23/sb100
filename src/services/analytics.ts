/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Google Tag Manager (GTM) & Google Analytics 4 (GA4) Service
 * Provides type-safe event tracking, SPA virtual page views, and e-commerce analytics.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;

// Helper to determine if an ID is active and not a placeholder
function isValidId(id?: string): boolean {
  if (!id) return false;
  const trimmed = id.trim().toUpperCase();
  return (
    trimmed.length > 5 &&
    !trimmed.includes('PLACEHOLDER') &&
    !trimmed.includes('XXXX') &&
    !trimmed.includes('MY_')
  );
}

export interface AnalyticsPurchaseOrder {
  orderId: string;
  totalCost: number;
  currency?: string;
  quantity?: number;
  bindingType?: string;
  bookTitle?: string;
  bookId?: string;
  shippingLevel?: string;
}

export interface AnalyticsPdfGeneration {
  bookTitle?: string;
  bookId?: string;
  mode: 'full' | 'pod-interior' | 'cover-spread';
  trimSize?: string;
  chaptersCount?: number;
  estimatedPages?: number;
}

export interface AnalyticsAiVoice {
  voiceId?: string;
  voiceName?: string;
  gender?: string;
  isClone?: boolean;
  storyId?: string;
}

let isInitialized = false;

export const analytics = {
  /**
   * Initializes dataLayer, gtag function, and injects GTM / Google Tag script if configured.
   */
  init: () => {
    if (typeof window === 'undefined' || isInitialized) return;

    // 1. Always initialize window.dataLayer for GTM compatibility
    window.dataLayer = window.dataLayer || [];

    // 2. Define global gtag helper
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }

    const hasValidGa = isValidId(GA_ID);
    const hasValidGtm = isValidId(GTM_ID);

    if (hasValidGtm) {
      // Load Google Tag Manager Container
      const gtmScript = document.createElement('script');
      gtmScript.async = true;
      gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(gtmScript);
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      console.info(`[Analytics] Google Tag Manager initialized with Container ID: ${GTM_ID}`);
    } else if (hasValidGa) {
      // Load Google Tag for GA4 directly via googletagmanager.com/gtag/js
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(gaScript);

      window.gtag('js', new Date());
      window.gtag('config', GA_ID!, {
        send_page_view: false, // SPA virtual page views tracked manually
        anonymize_ip: true,
      });
      console.info(`[Analytics] Google Analytics 4 initialized with Measurement ID: ${GA_ID}`);
    } else {
      console.debug(
        `[Analytics] Running in development/placeholder mode (GA: ${GA_ID || 'none'}, GTM: ${GTM_ID || 'none'}). Events logged to debug console.`
      );
    }

    isInitialized = true;
  },

  /**
   * Track virtual page/screen views in the Single Page Application.
   */
  pageView: (path: string, title?: string) => {
    const pageTitle = title || document.title;
    const pageLocation = window.location.origin + path;

    // Push to GTM dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'virtual_page_view',
        page_path: path,
        page_title: pageTitle,
        page_location: pageLocation,
      });
    }

    // Call gtag if loaded
    if (window.gtag && isValidId(GA_ID)) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: pageTitle,
        page_location: pageLocation,
      });
    }

    if (!isValidId(GA_ID) && !isValidId(GTM_ID)) {
      console.debug(`[Analytics DEBUG] Page View -> ${path} ("${pageTitle}")`);
    }
  },

  /**
   * Track generic custom events.
   */
  event: (eventName: string, params: Record<string, any> = {}) => {
    // 1. Push to dataLayer for GTM triggers
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }

    // 2. Dispatch to GA4
    if (window.gtag && isValidId(GA_ID)) {
      window.gtag('event', eventName, params);
    }

    if (!isValidId(GA_ID) && !isValidId(GTM_ID)) {
      console.debug(`[Analytics DEBUG] Event -> ${eventName}`, params);
    }
  },

  /**
   * Track E-Commerce Print-on-Demand Purchase (Lulu physical order).
   */
  purchase: (order: AnalyticsPurchaseOrder) => {
    const currency = order.currency || 'USD';
    const quantity = Math.max(order.quantity || 1, 1);
    const unitPrice = order.totalCost / quantity;

    const ecomPayload = {
      transaction_id: order.orderId,
      value: order.totalCost,
      currency,
      items: [
        {
          item_id: order.bookId || 'backstory_heirloom',
          item_name: order.bookTitle || 'BackStory Heirloom Print Keepsake',
          item_category: order.bindingType || 'HARDCOVER',
          price: Math.round(unitPrice * 100) / 100,
          quantity,
        },
      ],
      shipping_level: order.shippingLevel || 'MAIL',
    };

    // GTM enhanced e-commerce push
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: ecomPayload,
      });
    }

    if (window.gtag && isValidId(GA_ID)) {
      window.gtag('event', 'purchase', ecomPayload);
    }

    if (!isValidId(GA_ID) && !isValidId(GTM_ID)) {
      console.debug(`[Analytics DEBUG] E-Commerce Purchase ->`, ecomPayload);
    }
  },

  /**
   * Track BackStory PDF Generation.
   */
  storybookPdf: (data: AnalyticsPdfGeneration) => {
    analytics.event('storybook_pdf_generate', {
      book_title: data.bookTitle,
      book_id: data.bookId,
      pdf_mode: data.mode,
      trim_size: data.trimSize,
      chapters_count: data.chaptersCount,
      estimated_pages: data.estimatedPages,
    });
  },

  /**
   * Track AI Voice Narration Generation.
   */
  aiVoice: (data: AnalyticsAiVoice) => {
    analytics.event('ai_voice_generate', {
      voice_id: data.voiceId,
      voice_name: data.voiceName,
      voice_gender: data.gender,
      is_personal_clone: Boolean(data.isClone),
      story_id: data.storyId,
    });
  },
};

