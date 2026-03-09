'use client';

import { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Load Turnstile script if not already loaded
    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        renderWidget();
      };
    } else if (window.turnstile) {
      // Script already loaded
      renderWidget();
    } else {
      // Script loading in progress, wait for it
      window.onTurnstileLoad = renderWidget;
    }

    return () => {
      // Cleanup: remove widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          console.error('Failed to remove Turnstile widget:', e);
        }
      }
    };
  }, []);

  const renderWidget = () => {
    if (!containerRef.current || !window.turnstile) return;

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    
    if (!siteKey) {
      console.error('Turnstile site key not configured');
      return;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'dark', // Matches RYVYNN aesthetic
        size: 'invisible', // No user interaction required
        callback: (token: string) => {
          onSuccess(token);
        },
        'error-callback': () => {
          if (onError) onError();
        },
        'expired-callback': () => {
          if (onExpire) onExpire();
        },
      });
    } catch (e) {
      console.error('Failed to render Turnstile widget:', e);
    }
  };

  return <div ref={containerRef} className="cf-turnstile" />;
}
