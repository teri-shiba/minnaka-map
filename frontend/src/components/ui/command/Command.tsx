'use client'

import type { DialogProps } from '@radix-ui/react-dialog'
import type { ComponentPropsWithoutRef, HTMLAttributes, RefObject } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { memo } from 'react'

import { Dialog, DialogContent } from '~/components/ui/dialogs/Dialog'
import { cn } from '~/utils/utils'

const Command = memo(({ ref, className, ...props }: ComponentPropsWithoutRef<typeof CommandPrimitive> & { ref?: RefObject<HTMLDivElement> }) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground border border-input',
      className,
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = memo(({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
})

const CommandInput = memo(({ ref, className, ...props }: ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & { ref?: RefObject<HTMLInputElement> }) => (
  <div className="flex items-center px-3" cmdk-input-wrapper="">
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = memo(({ ref, className, ...props }: ComponentPropsWithoutRef<typeof CommandPrimitive.List> & { ref?: RefObject<HTMLDivElement> }) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = memo(({ ref, ...props }: ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> & { ref?: RefObject<HTMLDivElement> }) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = memo(({ ref, className, ...props }: ComponentPropsWithoutRef<typeof CommandPrimitive.Group> & { ref?: RefObject<HTMLDivElement> }) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className,
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = memo(({ ref, className, ...props }: ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> & { ref?: RefObject<HTMLDivElement> }) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
))

CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = memo(({ ref, className, ...props }: ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & { ref?: RefObject<HTMLDivElement> }) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=\'true\']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      className,
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = memo(({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
})

CommandShortcut.displayName = 'CommandShortcut'

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
