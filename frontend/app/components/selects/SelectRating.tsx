import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select'

interface CategoryProps {
  label: string
  value: string
}

export default function SelectRating() {
  const ratings = [
    { label: 'すべての評価', value: 'all' },
    { label: '4.5 以上', value: '4.5' },
    { label: '4.0 以上', value: '4' },
    { label: '3.5 以上', value: '3.5' },
    { label: '3.0 以上', value: '3' },
    { label: '2.5 以上', value: '2.5' },
    { label: '2.0 以上', value: '2' },
  ]

  return (
    <Select>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="レビュー" />
      </SelectTrigger>
      <SelectContent>
        {ratings.map((rating: CategoryProps) => {
          return (
            <SelectItem
              key={rating.label}
              value={rating.value}
            >
              {rating.label}
            </SelectItem>
          )
        }) }
      </SelectContent>
    </Select>
  )
}
