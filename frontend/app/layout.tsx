import type { Metadata } from 'next'
import Footer from './components/ui/Footer'
import Header from './components/ui/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'みんなかマップ',
  description: 'みんなかマップは、複数人の中間地点を見つけて、周辺の飲食店を探せるサービスです。友人との集まり、デート、ミーティングなど、みんなが集まる際の場所選びをサポートします。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="px-5 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
