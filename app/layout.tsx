import './globals.css';
import Script from 'next/script';
import Analytics from '@/components/Analytics';

export const metadata = {
  metadataBase: new URL('https://gifty.run'),
  title: 'Gifty - 마법처럼 움짤로!',
  description: '가입 없이 브라우저에서 바로 동영상을 고화질 GIF로 변환해 보세요. 100% 무료입니다!',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Gifty - 마법처럼 움짤로!',
    description: '설치 없이 브라우저에서 바로 고화질 GIF를 만들어 보세요.',
    url: 'https://gifty.run',
    siteName: 'Gifty',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gifty - 마법처럼 움짤로!',
    description: '설치 없이 브라우저에서 바로 고화질 GIF를 만들어 보세요.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7186754693915211"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
