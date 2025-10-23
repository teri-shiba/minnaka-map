import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import ErrorToastListener from '~/components/error-toast-listener'
import { AuthProvider } from '~/components/features/account/auth/auth-provider'
import Footer from '~/components/layout/footer'
import Header from '~/components/layout/header'
import { Toaster } from '~/components/ui/toast'
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
        <AuthProvider />
        <Suspense fallback={null}>
          <ErrorToastListener />
        </Suspense>
        <Footer />
      </body>
    </html>
  )
}
