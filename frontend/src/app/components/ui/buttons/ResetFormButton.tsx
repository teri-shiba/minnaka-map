import type { UseFormReturn } from 'react-hook-form'
import type { AreaFormValues } from '~/app/types'

import { LuX } from 'react-icons/lu'
import { Button } from './Button'

interface ResetFormButtonProps {
  form: UseFormReturn<AreaFormValues>
  index: number
}

export function ResetFormButton({ form, index }: ResetFormButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={() => { form.resetField(`area.${index}`) }}
      className="absolute right-2 top-1/2 !mt-0 size-5 -translate-y-1/2 rounded-full bg-gray-300 font-bold hover:bg-gray-500"
    >
      <LuX className="!size-3 stroke-[3]" />
    </Button>
  )
}
