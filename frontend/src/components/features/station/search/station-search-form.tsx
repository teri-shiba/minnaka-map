'use client'

import type { AreaFormValues } from '~/schemas/station-search.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form'
import { useMidpointMutation } from '~/hooks/useMidpointMutation'
import { logger } from '~/lib/logger'
import { stationSearchSchema } from '~/schemas/station-search.schema'
import { AddFormButton } from './buttons/add-form-button'
import { RemoveFormButton } from './buttons/remove-form-button'
import { ResetFormButton } from './buttons/reset-form-button'
import StationAutocomplete from './station-autocomplete'

const MAX_AREA_FIELDS = 6
const MAX_REQUIRED_FIELDS = 2

export default function StationSearchForm() {
  const router = useRouter()
  const { trigger: postMidpoint, isMutating } = useMidpointMutation()

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(stationSearchSchema),
    defaultValues: {
      area: [
        { areaValue: '', stationId: null, latitude: null, longitude: null },
        { areaValue: '', stationId: null, latitude: null, longitude: null },
      ],
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const { fields, append, remove } = useFieldArray({
    name: 'area',
    control: form.control,
  })

  const watchedArea = form.watch('area')

  const processValidData = async (data: AreaFormValues) => {
    try {
      const stationIds = data.area
        .filter(s => s.stationId !== null)
        .map(s => s.stationId as number)

      if (typeof window !== 'undefined') {
        const rawPrev = sessionStorage.getItem('pendingStationIds')
        if (rawPrev) {
          const prevIds = JSON.parse(rawPrev) as number[]
          const sortedPrevIds = [...prevIds].sort((a, b) => a - b)
          const sortedStationIds = [...stationIds].sort((a, b) => a - b)

          const isSameStationIds
            = sortedPrevIds.length === sortedStationIds.length
              && sortedPrevIds.every((prevStationId, i) =>
                prevStationId === sortedStationIds[i])

          if (!isSameStationIds) {
            sessionStorage.removeItem('pendingSearchHistoryId')
          }
        }

        sessionStorage.setItem('pendingStationIds', JSON.stringify(stationIds))
      }

      const midpointResult = await postMidpoint({
        area: { station_ids: stationIds },
      })

      const query: Record<string, string> = {
        lat: midpointResult.midpoint.latitude,
        lng: midpointResult.midpoint.longitude,
      }

      if (midpointResult.signature)
        query.signature = midpointResult.signature

      if (midpointResult.expires_at)
        query.expires_at = midpointResult.expires_at

      const qs = new URLSearchParams(query).toString()
      router.push(`/result?${qs}`)
    }
    catch (error) {
      logger(error, { component: 'StationSearchForm - processValidData' })
      toast.error('フォームの送信に失敗しました。時間を置いてから、再度お試しください。')
    }
  }

  const handleValidationErrors = (errors: any) => {
    if (errors.area) {
      if ('root' in errors.area && errors.area.root?.message) {
        toast.error(errors.area.root.message)
      }
      else if (errors.area.message) {
        toast.error(errors.area.message)
      }
    }
  }

  const handleFormEvent = (e: React.FormEvent) => {
    e.preventDefault()

    form.handleSubmit(
      validData => processValidData(validData),
      errors => handleValidationErrors(errors),
    )(e)
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
            const currentFieldValue = watchedArea[index]?.areaValue ?? ''

            const excludedStations = watchedArea
              .map(item => item.areaValue)
              .filter(name => name !== '' && name !== currentFieldValue)

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
                          value={field.value}
                          onChange={(value, stationId, latitude, longitude) => {
                            field.onChange(value)
                            form.setValue(`area.${index}.stationId`, stationId || null)
                            form.setValue(`area.${index}.latitude`, latitude ? Number(latitude) : null)
                            form.setValue(`area.${index}.longitude`, longitude ? Number(longitude) : null)
                          }}
                          placeholder={`${index + 1}人目の出発駅`}
                          excludedStations={excludedStations}
                        />
                      </FormControl>
                      {renderFieldButtons(index, field.value)}
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
          disabled={isMutating}
          variant="default"
          size="lg"
          className="block w-full md:inline-block md:w-auto"
        >
          検索する
        </Button>
      </form>
    </Form>
  )
}
