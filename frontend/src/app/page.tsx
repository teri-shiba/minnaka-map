'use client'
import useConfirmEmail from './hooks/useConfirmEmail'
import useOAuthCallback from './hooks/useOAuthCallback'

export default function Home() {
  useOAuthCallback()
  useConfirmEmail()

  return (
    <div>Hello</div>
  )
}
