import type { FieldArrayWithId, UseFieldArrayAppend } from 'react-hook-form'
import type { AreaFormValues } from '~/app/lib/schemas/areaSearchSchema'
import { LuPlus } from 'react-icons/lu'
import { Button } from './Button'

interface AddFormButtonProps {
  fields: FieldArrayWithId<AreaFormValues>[]
  append: UseFieldArrayAppend<AreaFormValues>
}

export function AddFormButton({ fields, append }: AddFormButtonProps) {
  const handleAddForm = () => {
    if (fields.length < 6) {
      append({ areaValue: '' })
    }
  }

  return (
    <Button
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
