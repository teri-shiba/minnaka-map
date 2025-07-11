import { LuAlignLeft } from 'react-icons/lu'

export default function RestaurantListHeader({ totalCount }: { totalCount: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between">
      <h2 className="text-base">
        検索結果 全
        {totalCount}
        件
      </h2>
      <p className="text-sm">
        <LuAlignLeft className="mb-0.5 mr-1 inline size-3.5" />
        中心地点から近い順
      </p>
    </div>
  )
}
