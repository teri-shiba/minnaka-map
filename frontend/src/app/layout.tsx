import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { AuthProvider } from '~/components/features/account/auth/auth-provider'
import Footer from '~/components/layout/footer'
import Header from '~/components/layout/header'
import ToastListener from '~/components/toast-listener'
import { Toaster } from '~/components/ui/toast'
import '~/styles/globals.css'

const SITE_NAME = 'みんなかマップ'
const SITE_URL = process.env.NEXT_PUBLIC_FRONT_BASE_URL!
const SITE_DESCRIPTION = 'みんなかマップは、複数人の出発駅から中間地点を算出し、その周辺の飲食店を探せるサービスです。友人との集まりやデート、ミーティングなど、みんなで集まる場所選びをスムーズにします。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s｜${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
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
          <ToastListener />
        </Suspense>
        <AuthProvider />
        <Footer />
      </body>
    </html>
  )
}
