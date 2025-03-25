import { z } from 'zod'

export const areaFormSchema = z.object({
  area: z.array(z.object({
    areaValue: z.string(),
  }),
  )
    .refine(areas => areas.filter(a => a.areaValue.trim() !== '').length >= 2, {
      message: '出発地点を2つ以上入力してください',
      path: ['area'],
    })
    .refine((areas) => {
      const values = areas.map(a => a.areaValue.trim()).filter(v => v !== '')
      return new Set(values).size === values.length
    }, {
      message: '同じ出発地点が含まれています',
      path: ['area'],
    }),
})

export type AreaFormValues = z.infer<typeof areaFormSchema>
