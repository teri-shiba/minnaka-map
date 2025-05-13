import { z } from 'zod'

export const areaFormSchema = z.object({
  area: z.array(
    z.object({
      areaValue: z.string().trim().min(1, '出発地点を入力してください'),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
    }),
  )
    .refine(areas => areas.filter(a => a.areaValue.trim() !== '').length >= 2, {
      message: '出発地点を2つ以上入力してください',
      path: [],
    })
    .refine((areas) => {
      const values = areas.map(a => a.areaValue.trim()).filter(v => v !== '')
      return new Set(values).size === values.length
    }, {
      message: '同じ出発地点が含まれています',
      path: [],
    }),
})

export type AreaFormValues = z.infer<typeof areaFormSchema>
