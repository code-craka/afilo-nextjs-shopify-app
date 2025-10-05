// Analytics and Monitoring Configuration for Afilo Enterprise
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    hj?: (...args: unknown[]) => void;
    Intercom?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
}

export interface EnterpriseAnalyticsData {
  user_type: 'professional' | 'enterprise' | 'enterprise_plus' | 'trial';
  plan_value: number;
  subscription_id?: string;
  company_size?: string;
  industry?: string;
}

// Google Analytics 4 Configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track enterprise events
export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    });
  }

  // Minimal console log for development (only critical events)
  if (process.env.NODE_ENV === 'development' && event.category !== 'performance') {
    console.debug('Analytics:', event.name);
  }
};

// Enterprise-specific tracking
export const trackEnterpriseEvent = (event: AnalyticsEvent, enterpriseData: EnterpriseAnalyticsData) => {
  trackEvent({
    ...event,
    custom_parameters: {
      ...event.custom_parameters,
      user_type: enterpriseData.user_type,
      plan_value: enterpriseData.plan_value,
      subscription_id: enterpriseData.subscription_id,
      company_size: enterpriseData.company_size,
      industry: enterpriseData.industry,
    },
  });
};

// Sales funnel tracking
export const trackSalesFunnel = (stage: string, value?: number, additionalData?: Record<string, unknown>) => {
  trackEvent({
    action: 'sales_funnel_progression',
    category: 'enterprise_sales',
    label: stage,
    value,
    custom_parameters: {
      funnel_stage: stage,
      timestamp: new Date().toISOString(),
      ...additionalData,
    },
  });
};

// Subscription events
export const trackSubscriptionEvent = (
  action: 'trial_started' | 'subscription_created' | 'upgrade' | 'downgrade' | 'cancellation',
  planName: string,
  value: number,
  additionalData?: Record<string, unknown>
) => {
  trackEvent({
    action,
    category: 'subscription',
    label: planName,
    value,
    custom_parameters: {
      plan_name: planName,
      timestamp: new Date().toISOString(),
      ...additionalData,
    },
  });
};

// Enterprise quote tracking
export const trackQuoteEvent = (
  action: 'quote_requested' | 'quote_submitted' | 'quote_converted',
  estimatedValue: number,
  additionalData?: Record<string, unknown>
) => {
  trackEvent({
    action,
    category: 'enterprise_quotes',
    label: `quote_${estimatedValue}`,
    value: estimatedValue,
    custom_parameters: {
      estimated_value: estimatedValue,
      timestamp: new Date().toISOString(),
      ...additionalData,
    },
  });
};

// Product interaction tracking
export const trackProductInteraction = (
  action: 'view' | 'add_to_cart' | 'purchase' | 'trial_start',
  productId: string,
  productName: string,
  value?: number
) => {
  trackEvent({
    action: `product_${action}`,
    category: 'ecommerce',
    label: productName,
    value,
    custom_parameters: {
      product_id: productId,
      product_name: productName,
      timestamp: new Date().toISOString(),
    },
  });
};

// Page view tracking
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title,
      page_location: url,
    });
  }
};

// Hotjar Configuration
export const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;

export const initHotjar = () => {
  if (typeof window !== 'undefined' && HOTJAR_ID) {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    document.head.appendChild(script);
  }
};

// Intercom Configuration for Enterprise Support
export const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

export const initIntercom = (userData?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && INTERCOM_APP_ID) {
    const script = document.createElement('script');
    script.innerHTML = `
      window.intercomSettings = {
        app_id: "${INTERCOM_APP_ID}",
        ${userData ? Object.entries(userData).map(([key, value]) => `${key}: "${value}"`).join(',') : ''}
      };
      (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${INTERCOM_APP_ID}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
    `;
    document.head.appendChild(script);
  }
};

// Error tracking
export const trackError = (error: Error, context?: Record<string, unknown>) => {
  trackEvent({
    action: 'javascript_error',
    category: 'errors',
    label: error.message,
    custom_parameters: {
      error_stack: error.stack,
      error_name: error.name,
      context,
      timestamp: new Date().toISOString(),
    },
  });
};

// Performance tracking
export const trackPerformance = (metric: string, value: number, context?: Record<string, unknown>) => {
  trackEvent({
    action: 'performance_metric',
    category: 'performance',
    label: metric,
    value,
    custom_parameters: {
      metric_name: metric,
      metric_value: value,
      context,
      timestamp: new Date().toISOString(),
    },
  });
};

// Initialize all analytics services
export const initAnalytics = (userData?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    initGA();
    initHotjar();
    initIntercom(userData);

    // Track initial page load
    trackPageView(window.location.href, document.title);

    // Track performance metrics
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
          trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        }
      }, 1000);
    }
  }
};