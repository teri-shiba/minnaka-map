import { z } from 'zod'

export const areaFormSchema = z.object({
  area: z.array(z.object({
    areaValue: z.string(),
  })),
})
