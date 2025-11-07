import z from 'zod'

// UI制御
export const stationSearchSchema = z.object({
  area: z.array(
    z.object({
      areaValue: z.string().trim().optional().default(''),
      stationId: z.number().nullable(),
    }),
  ),
})

export type StationSearchSchema = typeof stationSearchSchema
export type AreaFormInput = z.input<StationSearchSchema>
export type AreaFormOutput = z.output<StationSearchSchema>

// フォーム送信
export const stationSearchSubmitSchema = z.object({
  area: z.array(
    z.object({
      stationId: z.number().nullable(),
    }),
  )
    .superRefine(
      (data, ctx) => {
        const stationIds = data
          .map(item => item.stationId)
          .filter((id): id is number => id != null)

        if (stationIds.length < 2) {
          ctx.addIssue({
            code: 'custom',
            message: '出発地点を2つ以上入力してください',
            path: ['area'],
          })
        }

        if (new Set(stationIds).size !== stationIds.length) {
          ctx.addIssue({
            code: 'custom',
            message: '同じ出発地点が含まれています',
            path: ['area'],
          })
        }
      },
    ),
})

export type StationSearchSubmit = z.infer<typeof stationSearchSubmitSchema>
