'use client';

import React, { useMemo } from 'react';

interface CoupangBannerProps {
  htmlCode: string;
}

export default function CoupangBanner({ htmlCode }: CoupangBannerProps) {
  // If no code, return null
  if (!htmlCode || !htmlCode.trim()) return null;

  // Try to parse the script format: new PartnersCoupang.G({...})
  const parsed = useMemo(() => {
    try {
      // Look for the JSON object passed to PartnersCoupang.G
      const match = htmlCode.match(/new\s+PartnersCoupang\.G\(([\s\S]*?)\);?/);
      if (match && match[1]) {
        const config = JSON.parse(match[1]);
        return config;
      }
    } catch (e) {
      console.warn("Failed to parse Coupang script tag", e);
    }
    return null;
  }, [htmlCode]);

  // If it successfully parsed the script tag, render as an iframe
  if (parsed && parsed.id && parsed.trackingCode) {
    const src = `https://ads-partners.coupang.com/widgets.html?id=${encodeURIComponent(parsed.id)}&template=${encodeURIComponent(parsed.template || 'carousel')}&trackingCode=${encodeURIComponent(parsed.trackingCode)}&subId=${encodeURIComponent(parsed.subId || '')}`;
    
    return (
      <iframe
        src={src}
        width={parsed.width || "680"}
        height={parsed.height || "140"}
        frameBorder="0"
        scrolling="no"
        referrerPolicy="unsafe-url"
        style={{ maxWidth: '100%', border: 'none' }}
      ></iframe>
    );
  }

  // Fallback: If they provided an iframe directly or something else, use dangerouslySetInnerHTML
  // Note: <script> tags will not execute here, which is why we parse above.
  return <div dangerouslySetInnerHTML={{ __html: htmlCode }} style={{ maxWidth: '100%', overflow: 'hidden' }} />;
}
