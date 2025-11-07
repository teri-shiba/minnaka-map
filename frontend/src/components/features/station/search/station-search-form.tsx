'use client'

import type { AreaFormInput, AreaFormOutput } from '~/schemas/station-search.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form'
import { logger } from '~/lib/logger'
import { stationSearchSchema, stationSearchSubmitSchema } from '~/schemas/station-search.schema'
import { getMidpoint } from '~/services/get-midpoint'
import { AddFormButton } from './buttons/add-form-button'
import { RemoveFormButton } from './buttons/remove-form-button'
import { ResetFormButton } from './buttons/reset-form-button'
import StationAutocomplete from './station-autocomplete'

const MAX_AREA_FIELDS = 6
const MAX_REQUIRED_FIELDS = 2

export default function StationSearchForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const defaults: AreaFormInput = {
    area: [
      { areaValue: '', stationId: null },
      { areaValue: '', stationId: null },
    ],
  }

  const form = useForm<AreaFormInput, any, AreaFormOutput>({
    resolver: zodResolver(stationSearchSchema),
    defaultValues: defaults,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const { fields, append, remove } = useFieldArray({
    name: 'area',
    control: form.control,
  })

  const watchedArea = form.watch('area')

  const processValidData = async (data: AreaFormOutput) => {
    const parsed = stationSearchSubmitSchema.safeParse({ area: data.area })
    if (!parsed.success) {
      form.clearErrors('area')

      for (const issue of parsed.error.issues) {
        if (issue.path.join('.') === 'area' || issue.path.length === 0) {
          form.setError('area', { type: 'custom', message: issue.message })
        }
      }

      toast.error(parsed.error.issues[0]?.message ?? '入力内容を確認してください')
      return
    }

    const stationIds = data.area
      .map(s => s.stationId)
      .filter((id): id is number => id != null)

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingStationIds', JSON.stringify(stationIds))
    }

    try {
      const result = await getMidpoint(stationIds)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      const { midpoint, sig, exp } = result.data
      const params = new URLSearchParams({
        lat: midpoint.lat,
        lng: midpoint.lng,
        stationIds: stationIds.join('-'),
        ...(sig && { sig }),
        ...(exp && { exp }),
      })

      const url = `/result?${params}`
      router.prefetch(url)
      startTransition(() => router.push(url))
    }
    catch (error) {
      logger(error, {
        component: 'StationSearchForm',
        action: 'processValidData',
      })
      toast.error('フォームの送信に失敗しました。時間をおいてから、再度お試しください。')
    }
  }

  const handleFormEvent = (e: React.FormEvent) => {
    e.preventDefault()
    form.handleSubmit(processValidData)(e)
  }

  const renderFieldButtons = (index: number, value: string) => {
    if (index >= MAX_REQUIRED_FIELDS) {
      return value
        ? <ResetFormButton index={index} form={form} />
        : <RemoveFormButton index={index} remove={remove} />
    }
    return value ? <ResetFormButton index={index} form={form} /> : null
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormEvent} noValidate>

        <div className="mb-6 md:grid md:grid-flow-col md:grid-cols-2 md:grid-rows-3 md:gap-x-6 md:gap-y-3">
          {fields.map((field, index) => {
            const excludedStationIds = watchedArea
              .map((item, i) => i === index ? null : item.stationId)
              .filter((id): id is number => id !== null)

            return (
              <div key={field.id} className="mb-2">
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`area.${index}.areaValue`}
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <StationAutocomplete
                          {...field}
                          value={field.value ?? ''}
                          onChange={(value, stationId) => {
                            field.onChange(value)
                            form.setValue(`area.${index}.stationId`, stationId || null)
                          }}
                          placeholder={`${index + 1}人目の出発駅`}
                          excludedStationIds={excludedStationIds}
                        />
                      </FormControl>
                      {renderFieldButtons(index, field.value ?? '')}
                    </FormItem>
                  )}
                />
              </div>
            )
          })}

          {fields.length < MAX_AREA_FIELDS && (
            <AddFormButton append={append} fields={fields} />
          )}
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting || isPending}
          variant="default"
          size="lg"
          className="block w-full md:inline-block md:w-auto"
        >
          {(form.formState.isSubmitting || isPending) ? '検索中...' : '検索する'}
        </Button>
      </form>
    </Form>
  )
}
