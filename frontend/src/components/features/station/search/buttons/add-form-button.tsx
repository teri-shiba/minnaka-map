'use client'

import type { FieldArrayWithId, UseFieldArrayAppend } from 'react-hook-form'
import type { AreaFormInput } from '~/schemas/station-search.schema'
import { LuPlus } from 'react-icons/lu'
import { Button } from '~/components/ui/button'

interface AddFormButtonProps {
  fields: FieldArrayWithId<AreaFormInput, 'area'>[]
  append: UseFieldArrayAppend<AreaFormInput, 'area'>
}

export function AddFormButton({ fields, append }: AddFormButtonProps) {
  const handleAddForm = () => {
    if (fields.length < 6) {
      append({ areaValue: '', stationId: null })
    }
  }

  return (
    <Button
      aria-label="追加"
      type="button"
      onClick={handleAddForm}
      variant="link"
      className="justify-start px-0 text-secondary-foreground"
    >
      <LuPlus className="stroke-[3]" />
      {`${fields.length + 1}人目を追加する`}
    </Button>
  )
}
