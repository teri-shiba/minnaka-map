'use client'

import type { AreaFormValues } from '~/schemas/station-search.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '~/components/ui/buttons/Button'
import { logger } from '~/lib/logger'
import { stationSearchSchema } from '~/schemas/station-search.schema'
import { saveSearchHistory } from '~/services/save-search-history'
import StationAutocomplete from '../autocomplete/StationAutocomplete'
import { AddFormButton } from '../buttons/AddFormButton'
import { RemoveFormButton } from '../buttons/RemoveFormButton'
import { ResetFormButton } from '../buttons/ResetFormButton'
import { Form, FormControl, FormField, FormItem } from './Form'

const MAX_AREA_FIELDS = 6
const MAX_REQUIRED_FIELDS = 2

export default function StationSearchForm() {
  const router = useRouter()
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

  const processSaveHistory = async (data: AreaFormValues): Promise<number | null> => {
    try {
      const stationIds = data.area
        .filter(station => station.stationId !== null)
        .map(station => station.stationId as number)

      const result = await saveSearchHistory(stationIds)
      if (!result.success)
        return null

      return result.data.searchHistoryId
    }
    catch (error) {
      // TODO2: エラーハンドリングの修正:「検索履歴保存に失敗しても検索は続行」とあるがそれではアプリケーションの設計上成り立たないのでどうするか考える
      logger(
        error,
        { tags: {
          component: 'StationSearchForm - processSaveHistory',
        } },
      )
      return null
    }
  }

  const processValidData = async (data: AreaFormValues) => {
    try {
      const midpointResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/midpoint`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      )

      const midpointResult = await midpointResponse.json()
      // TODO3: ErrorHandlerToast に踏襲する
      if (!midpointResponse.ok) {
        throw new Error('APIリクエストに失敗しました')
      }

      const searchHistoryId = await processSaveHistory(data)

      const query: Record<string, string> = {
        lat: midpointResult.midpoint.latitude,
        lng: midpointResult.midpoint.longitude,
        signature: midpointResult.signature,
      }

      if (midpointResult.expires_at) {
        query.expires_at = midpointResult.expires_at
      }

      if (searchHistoryId) {
        query.search_history_id = searchHistoryId.toString()
      }

      const qs = new URLSearchParams(query).toString()
      router.push(`/result?${qs}`)
    }
    catch (error) {
      logger(error, { tags: { component: 'StationSearchForm - processValidData' } })
      toast.error('フォームの送信に失敗しました') // TODO4: 失敗したからどうすればの文言が足りないが適切なものがわからない
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
