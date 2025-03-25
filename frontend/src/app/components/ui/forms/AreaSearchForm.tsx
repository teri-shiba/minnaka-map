'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { areaFormSchema, type AreaFormValues } from '~/app/lib/shemas/areaSearchSchema'
import { Button } from '~/components/ui/buttons/Button'
import Autocomplete from '../autocomplete/Autocomplete'
import { AddFormButton } from '../buttons/AddFormButton'
import { RemoveFormButton } from '../buttons/RemoveFormButton'
import { ResetFormButton } from '../buttons/ResetFormButton'
import { Form, FormControl, FormField, FormItem } from './Form'

const MAX_AREA_FIELDS = 6
const MAX_REQUIRED_FIELDS = 2

export default function AreaSearchForm() {
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      // TODO: データの返り値に緯度経度を含めること（現在: value.area.areaValue）
      area: [{ areaValue: '' }, { areaValue: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: 'area',
    control: form.control,
  })

  const onSubmit = async (value: AreaFormValues) => {
    try {
      // TODO: データの返り値に緯度経度を含めること（現在: value.area.areaValue）
      console.log('value:', value)
    }
    catch (e) {
      console.error('フォーム送信エラー:', e)
      toast.error('フォームの送信に失敗しました')
    }
  }

  const renderFieldAction = (index: number, value: string) => {
    if (index >= MAX_REQUIRED_FIELDS) {
      return value
        ? <ResetFormButton index={index} form={form} />
        : <RemoveFormButton index={index} remove={remove} />
    }
    return value ? <ResetFormButton index={index} form={form} /> : null
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-6 md:grid md:grid-flow-col md:grid-cols-2 md:grid-rows-3 md:gap-x-6 md:gap-y-3">
          {fields.map((field, index) => {
            return (
              <div key={field.id} className="mb-2">
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`area.${index}.areaValue`}
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <Autocomplete
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={`${index + 1}人目の出発地点`}
                        />
                      </FormControl>

                      {renderFieldAction(index, field.value)}

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
