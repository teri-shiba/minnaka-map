import type { Metadata } from 'next'
import { Suspense } from 'react'
import Footer from '~/components/layout/Footer'
import Header from '~/components/layout/Header'
import ErrorToastHandler from '~/components/ui/toasts/ErrorToastHandler'
import { Toaster } from '~/components/ui/toasts/Toast'
import '~/styles/globals.css'

export const metadata: Metadata = {
  title: 'みんなかマップ',
  description: 'みんなかマップは、複数人の中間地点を見つけて、周辺の飲食店を探せるサービスです。友人との集まり、デート、ミーティングなど、みんなが集まる際の場所選びをサポートします。',
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
