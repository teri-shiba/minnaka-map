'use client'

import type { Path, UseFormReturn } from 'react-hook-form'
import type { AreaFormInput, AreaFormOutput } from '~/schemas/station-search.schema'
import { LuX } from 'react-icons/lu'
import { Button } from '~/components/ui/button'

interface ResetFormButtonProps {
  form: UseFormReturn<AreaFormInput, any, AreaFormOutput>
  index: number
}

export function ResetFormButton({ form, index }: ResetFormButtonProps) {
  const pathValue = `area.${index}.areaValue` as Path<AreaFormInput>
  const pathStation = `area.${index}.stationId` as Path<AreaFormInput>

  const handleClick = () => {
    form.resetField(pathValue, { defaultValue: '' })
    form.setValue(pathStation, null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    })
  }

  return (
    <Button
      aria-label="リセット"
      type="button"
      size="icon"
      onClick={handleClick}
      className="absolute right-2 top-1/2 !mt-0 size-5 -translate-y-1/2 rounded-full bg-gray-300 font-bold hover:bg-gray-500"
    >
      <LuX className="!size-3 stroke-[3]" />
    </Button>
  )
}
