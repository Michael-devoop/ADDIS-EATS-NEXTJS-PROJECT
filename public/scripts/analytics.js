/**
 * Lightweight, privacy-first analytics for Addis Eats
 * Loaded lazily during browser idle time via Next.js next/script (strategy="lazyOnload")
 */
(function() {
  if (typeof window === 'undefined') return;

  window.AddisAnalytics = {
    initialized: true,
    events: [],
    track: function(eventName, properties) {
      const payload = {
        event: eventName,
        properties: properties || {},
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      };
      this.events.push(payload);
    }
  };

  // Initial page view event
  window.AddisAnalytics.track('page_view', {
    title: document.title,
    referrer: document.referrer || 'direct'
  });

  // Track Core Web Vitals if PerformanceObserver is supported
  if ('PerformanceObserver' in window) {
    try {
      const po = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            window.AddisAnalytics.track('web_vital_lcp', { value: Math.round(entry.startTime) });
          }
        }
      });
      po.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // PerformanceObserver fallback ignored
    }
  }
})();
