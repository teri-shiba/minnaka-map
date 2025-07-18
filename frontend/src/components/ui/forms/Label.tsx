'use client'

import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ComponentRef, RefObject } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cva } from 'class-variance-authority'
import { cn } from '~/utils/cn'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
)

function Label({ ref, className, ...props }: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
  & VariantProps<typeof labelVariants> & { ref?: RefObject<ComponentRef<typeof LabelPrimitive.Root>> }) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    />
  )
}
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
