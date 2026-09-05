import './globals.css';
import Analytics from '@/components/Analytics';

export const metadata = {
  title: 'Gifty - 마법처럼 움짤로!',
  description: '무료 고화질 GIF 메이커',
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
