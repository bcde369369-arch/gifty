'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export default function AdSenseBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // slot이 지정되지 않은 심사 단계에서는 푸시하지 않음
    if (!slot || pushedRef.current) return;

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      console.warn('AdSense push error:', err);
    }
  }, [slot]);

  // 애드센스 단위 광고 슬롯 ID(slot)가 지정되지 않은 심사 단계에서는 레이아웃 깨짐/빈 박스 방지를 위해 숨김
  if (!slot) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden flex justify-center items-center text-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '280px', width: '100%' }}
        data-ad-client="ca-pub-7186754693915211"
        data-ad-slot={slot || undefined}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
