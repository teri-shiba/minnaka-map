'use client'
import useSWR from 'swr'
import { fetcher } from './lib/utils'

export default function Home() {
  const url = 'http://localhost:3000/api/v1/health_check'
  const { data, error, isLoading } = useSWR(url, fetcher)

  if (error)
    return <div>An error has occurred.</div>
  if (isLoading)
    return <div>Loading...</div>

  return (
    <>
      <div>Rails疎通確認</div>
      <div>
        レスポンスメッセージ：
        {data.message}
      </div>
    </>
  )
}
