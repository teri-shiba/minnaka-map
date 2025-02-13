'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { areaFormSchema } from '~/app/lib/shemas/areaSearchSchema'

import type { AreaFormValues } from '~/app/types'
import { Button } from '~/components/ui/buttons/Button'

import { Input } from '~/components/ui/forms/Input'
import { AddFormButton } from '../buttons/AddFormButton'
import { RemoveFormButton } from '../buttons/RemoveFormButton'

import { ResetFormButton } from '../buttons/ResetFormButton'
import { Form, FormControl, FormField, FormItem } from './Form'

export function AreaSearchForm() {
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      area: [{ areaValue: '' }, { areaValue: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: 'area',
    control: form.control,
  })

  const onSubmit = () => {
    // TODO:フォーム送信後の実装(引数 -> value: AreaFormValues)
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
                  name={`area.${index}`}
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <Input
                          placeholder={`${index + 1}人目の出発地点`}
                          {...field}
                          value={field.value.areaValue}
                          onChange={e => field.onChange({ areaValue: e.target.value })}
                          className="h-12 py-2 pl-3 pr-8"
                        />
                      </FormControl>

                      { index >= 2
                        ? field.value.areaValue
                          ? <ResetFormButton index={index} form={form} />
                          : <RemoveFormButton index={index} remove={remove} />
                        : field.value.areaValue && <ResetFormButton index={index} form={form} />}

                    </FormItem>
                  )}
                />
              </div>
            )
          })}

          {fields.length < 6 && (
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
