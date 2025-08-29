import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import Footer from '~/components/layout/Footer'
import Header from '~/components/layout/Header'
import { Toaster } from '~/components/ui/toast'
import ErrorToastHandler from '~/components/ui/toasts/ErrorToastHandler'
import '~/styles/globals.css'

export const metadata: Metadata = {
  title: 'みんなかマップ',
  description: 'みんなかマップは、複数人の中間地点を見つけて、周辺の飲食店を探せるサービスです。友人との集まり、デート、ミーティングなど、みんなが集まる際の場所選びをサポートします。',
}

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>
          {children}
        </main>
        <Toaster richColors />
        <Suspense fallback={null}>
          <ErrorToastHandler />
        </Suspense>
        <Footer />
      </body>
    </html>
  )
}
