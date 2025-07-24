import type { HTMLAttributes, RefObject } from 'react'
import { cn } from '~/utils/cn'

function Card({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-card text-card-foreground flex flex-col',
        className,
      )}
      {...props}
    />
  )
}
Card.displayName = 'Card'

function CardHeader({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}
CardHeader.displayName = 'CardHeader'

function CardTitle({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'text-lg font-bold',
        className,
      )}
      {...props}
    />
  )
}
CardTitle.displayName = 'CardTitle'

function CardDescription({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn('text-sm', className)}
      {...props}
    />
  )
}
CardDescription.displayName = 'CardDescription'

function CardContent({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: RefObject<HTMLDivElement> }) {
  return <div ref={ref} className={cn('py-2', className)} {...props} />
}
CardContent.displayName = 'CardContent'

function CardFooter({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
