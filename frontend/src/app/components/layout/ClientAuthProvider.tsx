'use client'

import Footer from '~/app/components/layout/Footer'
import Header from '~/app/components/layout/Header'
import { Toaster } from '~/app/components/ui/toasts/Toast'
import useUser from '~/app/hooks/useUser'

export default function ClientAuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isError } = useUser()

  if (isError) {
    console.error('認証情報を取得できませんでした')
    return null
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      {children}
      <Toaster richColors />
      <Footer />
    </div>
  )
}
