'use clinet'

import { LuMinus } from 'react-icons/lu'
import { Button } from '~/components/ui/button'

interface FormRemoveButtonProps {
  index: number
  remove: (index?: number | number[]) => void
}

export function RemoveFormButton({ index, remove }: FormRemoveButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={() => { remove(index) }}
      className="absolute right-2 top-1/2 !mt-0 size-5 -translate-y-1/2 rounded-full bg-gray-300 font-bold hover:bg-gray-500"
    >
      <LuMinus className="!size-3 stroke-[3]" />
    </Button>
  )
}
