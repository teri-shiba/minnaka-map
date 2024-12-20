import type { Metadata } from 'next'
import ClientAuthProvider from './components/layout/ClientAuthProvider'
import './styles/globals.css'

export const metadata: Metadata = {
  title: 'みんなかマップ',
  description: 'みんなかマップは、複数人の中間地点を見つけて、周辺の飲食店を探せるサービスです。友人との集まり、デート、ミーティングなど、みんなが集まる際の場所選びをサポートします。',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  )
}
