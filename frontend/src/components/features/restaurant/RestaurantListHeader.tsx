'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/selects/Select'
import { SORT_GENRE } from '~/constants'

interface RestaurantListHeaderProps {
  totalCount: number
}

export default function RestaurantListHeader({ totalCount }: RestaurantListHeaderProps) {
  const router = useRouter()
  const params = useSearchParams()
  const currentGenre = params.get('genre') ?? 'all'

  const onGenreChange = (code: string) => {
    const next = new URL(location.href)
    next.searchParams.delete('page')

    if (code === 'all') {
      next.searchParams.delete('genre')
    }
    else {
      next.searchParams.set('genre', code)
    }
    router.push(next.toString())
  }

  return (
    <div className="flex flex-wrap items-center justify-between">
      <h2 className="text-base">
        検索結果 全
        {totalCount}
        件
      </h2>
      {/* 料理ジャンル */}
      <Select value={currentGenre} onValueChange={onGenreChange}>
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

      {/* 中心点からの範囲 */}
    </div>
  )
}
