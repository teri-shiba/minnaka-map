import type { z } from 'zod'
import type { areaFormSchema } from '../lib/shemas/areaSearchSchema'

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>
  export default content
}

export type AreaFormValues = z.infer<typeof areaFormSchema>
