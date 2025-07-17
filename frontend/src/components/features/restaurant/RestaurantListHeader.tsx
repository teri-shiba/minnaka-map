'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/selects/Select'
import { SORT_GENRE } from '~/constants'

interface RestaurantListHeaderProps {
  totalCount: number
}

export default function RestaurantListHeader({ totalCount }: RestaurantListHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentGenre = searchParams.get('genre')
  const isValidGenre = currentGenre && SORT_GENRE.some(g => g.code === currentGenre)

  useEffect(() => {
    if (currentGenre && !isValidGenre) {
      const updatedUrl = new URL(window.location.href)
      updatedUrl.searchParams.delete('genre')
      updatedUrl.searchParams.delete('page')
      router.replace(updatedUrl.toString())
    }
  }, [currentGenre, isValidGenre, router])

  const validCurrentGenre = isValidGenre ? currentGenre : undefined

  const onGenreChange = (code: string) => {
    const updatedUrl = new URL(window.location.href)
    updatedUrl.searchParams.delete('page')

    if (code === 'all' || !code) {
      updatedUrl.searchParams.delete('genre')
    }
    else {
      updatedUrl.searchParams.set('genre', code)
    }
    router.push(updatedUrl.toString())
  }

  return (
    <div className="flex flex-wrap items-center justify-between">
      <h2 className="text-base">
        検索結果 全
        {totalCount}
        件
      </h2>
      <Select value={validCurrentGenre} onValueChange={onGenreChange}>
        <SelectTrigger className="md:w-40">
          <SelectValue placeholder="料理ジャンル" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          {SORT_GENRE.map(genre => (
            <SelectItem key={genre.code} value={genre.code}>
              {genre.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
