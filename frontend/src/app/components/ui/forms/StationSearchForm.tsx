'use client'
import type { AreaFormValues } from '~/app/lib/schemas/areaSearchSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { areaFormSchema } from '~/app/lib/schemas/areaSearchSchema'
import { Button } from '~/components/ui/buttons/Button'
import StationAutocomplete from '../autocomplete/StationAutocomplete'
import { AddFormButton } from '../buttons/AddFormButton'
import { RemoveFormButton } from '../buttons/RemoveFormButton'
import { ResetFormButton } from '../buttons/ResetFormButton'
import { Form, FormControl, FormField, FormItem } from './Form'

const MAX_AREA_FIELDS = 6
const MAX_REQUIRED_FIELDS = 2

export default function StetionSearchForm() {
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      // TODO: データの返り値に緯度経度を含めること（現在: value.area.areaValue）
      area: [{ areaValue: '' }, { areaValue: '' }],
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    name: 'area',
    control: form.control,
  })

  const watchedArea = form.watch('area')

  const onSubmit = async (value: AreaFormValues) => {
    try {
      // TODO: データの返り値に緯度経度を含めること（現在: value.area.areaValue）
      // TODO: 確認用・あとで削除する
      toast.success(`検索条件を送信しました: ${value}`)
    }
    catch (e) {
      console.error('フォーム送信エラー:', e)
      toast.error('フォームの送信に失敗しました')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    form.handleSubmit((data) => {
      onSubmit(data)
    })(e)

    const errors = form.formState.errors

    if (errors.area) {
      if ('root' in errors.area && errors.area.root?.message) {
        toast.error(errors.area.root.message)
      }
      else if (errors.area.message) {
        toast.error(errors.area.message)
      }
    }
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
      <form onSubmit={handleSubmit} noValidate>

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
                          onChange={field.onChange}
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
