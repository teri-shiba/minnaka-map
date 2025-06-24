'use client'

import type { ComponentPropsWithoutRef, ComponentRef, HTMLAttributes, RefObject } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { LuCheck, LuChevronRight, LuCircle } from 'react-icons/lu'

import { cn } from '~/utils/utils'

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

function DropdownMenuSubTrigger({ ref, className, inset, children, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
} & { ref?: RefObject<ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>> }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default gap-2 select-none items-center rounded-sm p-4 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <LuChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}
DropdownMenuSubTrigger.displayName
  = DropdownMenuPrimitive.SubTrigger.displayName

function DropdownMenuSubContent({ ref, className, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> & { ref?: RefObject<ComponentRef<typeof DropdownMenuPrimitive.SubContent>> }) {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  )
}
DropdownMenuSubContent.displayName
  = DropdownMenuPrimitive.SubContent.displayName

function DropdownMenuContent({ ref, className, sideOffset = 4, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & { ref?: RefObject<ComponentRef<typeof DropdownMenuPrimitive.Content>> }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-44 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg shadow-gray-200/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

function DropdownMenuItem({ ref, className, inset, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
} & { ref?: RefObject<ComponentRef<typeof DropdownMenuPrimitive.Item>> }) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-sm p-4 text-sm outline-none transition-colors focus:bg-gray-50 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  )
}
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

function DropdownMenuCheckboxItem({ ref, className, children, checked, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> & { ref?: RefObject<ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>> }) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <LuCheck className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}
DropdownMenuCheckboxItem.displayName
  = DropdownMenuPrimitive.CheckboxItem.displayName

function DropdownMenuRadioItem({ ref, className, children, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & { ref?: RefObject<ComponentRef<typeof DropdownMenuPrimitive.RadioItem>> }) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <LuCircle className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

function DropdownMenuLabel({ ref, className, inset, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
} & { ref?: RefObject<ComponentRef<typeof DropdownMenuPrimitive.Label>> }) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        'p-3 text-sm font-semibold',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  )
}
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

function DropdownMenuSeparator({ ref, className, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> & { ref?: RefObject<ComponentRef<typeof DropdownMenuPrimitive.Separator>> }) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  )
}
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

function DropdownMenuShortcut({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
