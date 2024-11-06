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

export default function SelectCategory() {
  const categories = [
    { label: '中華料理', value: 'chinese' },
    { label: 'フランス料理', value: 'french' },
    { label: 'ハンバーガー', value: 'hamburger' },
    { label: 'イタリア料理', value: 'italian' },
    { label: 'カレー', value: 'curry' },
    { label: '居酒屋', value: 'izakaya' },
    { label: '日本料理', value: 'japanese' },
    { label: '洋食', value: 'western' },
    { label: 'お好み焼き', value: 'okonomiyaki' },
    { label: 'ラーメン', value: 'ramen' },
    { label: 'しゃぶしゃぶ', value: 'syabusyabu' },
    { label: '蕎麦', value: 'soba' },
    { label: 'ステーキ', value: 'steak' },
    { label: '寿司', value: 'sushi' },
    { label: '天ぷら', value: 'tempura' },
    { label: 'うどん', value: 'udon' },
    { label: '焼肉', value: 'yakiniku' },
    { label: '焼鳥', value: 'yakitori' },
  ]

  return (
    <Select>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="料理ジャンル" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category: CategoryProps) => {
          return (
            <SelectItem
              key={category.label}
              value={category.value}
            >
              {category.label}
            </SelectItem>
          )
        }) }
      </SelectContent>
    </Select>
  )
}
