'use client'
import useConfirmEmail from './hooks/useConfirmEmail'

export default function Home() {
  useConfirmEmail()

  return (
    <div>Hello</div>
  )
}
