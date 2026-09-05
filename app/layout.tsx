import './globals.css';
import Analytics from '@/components/Analytics';

export const metadata = {
  metadataBase: new URL('https://gifty.run'),
  title: 'Gifty - 마법처럼 움짤로!',
  description: '가입 없이 브라우저에서 바로 동영상을 고화질 GIF로 변환해 보세요. 100% 무료입니다!',
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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
