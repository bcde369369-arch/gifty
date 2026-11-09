'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { trackSiteVisit, trackCheonlianEngagement } from '@/lib/visitorStats';

export default function Analytics() {
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-71MNQE4KRJ';
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    trackSiteVisit(pathname || undefined);
    startTimeRef.current = Date.now();

    // 🔮 천리안 엔진: 10초 이상 체류 시 GA4 기준 '진성 활성 사용자'로 자동 인증
    const timer = setTimeout(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      trackCheonlianEngagement(elapsed);
    }, 10000);

    const handleUnload = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      trackCheonlianEngagement(elapsed);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleUnload);
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed >= 5) {
        trackCheonlianEngagement(elapsed);
      }
    };
  }, [pathname]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
