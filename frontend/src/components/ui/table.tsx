import type { HTMLAttributes, RefObject, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '~/utils/cn'

function Table({ ref, className, ...props }: HTMLAttributes<HTMLTableElement> & { ref?: RefObject<HTMLTableElement | null> }) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}
Table.displayName = 'Table'

function TableHeader({ ref, className, ...props }: HTMLAttributes<HTMLTableSectionElement> & { ref?: RefObject<HTMLTableSectionElement | null> }) {
  return <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
}
TableHeader.displayName = 'TableHeader'

function TableBody({ ref, className, ...props }: HTMLAttributes<HTMLTableSectionElement> & { ref?: RefObject<HTMLTableSectionElement | null> }) {
  return (
    <tbody
      ref={ref}
      className={cn('', className)}
      {...props}
    />
  )
}
TableBody.displayName = 'TableBody'

function TableFooter({ ref, className, ...props }: HTMLAttributes<HTMLTableSectionElement> & { ref?: RefObject<HTMLTableSectionElement | null> }) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        'border-t bg-muted/50 font-medium',
        className,
      )}
      {...props}
    />
  )
}
TableFooter.displayName = 'TableFooter'

function TableRow({ ref, className, ...props }: HTMLAttributes<HTMLTableRowElement> & { ref?: RefObject<HTMLTableRowElement | null> }) {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-y transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  )
}
TableRow.displayName = 'TableRow'

function TableHead({ ref, className, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { ref?: RefObject<HTMLTableCellElement | null> }) {
  return (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-bold [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  )
}
TableHead.displayName = 'TableHead'

function TableCell({ ref, className, ...props }: TdHTMLAttributes<HTMLTableCellElement> & { ref?: RefObject<HTMLTableCellElement | null> }) {
  return (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
}
TableCell.displayName = 'TableCell'

function TableCaption({ ref, className, ...props }: HTMLAttributes<HTMLTableCaptionElement> & { ref?: RefObject<HTMLTableCaptionElement | null> }) {
  return (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
}
