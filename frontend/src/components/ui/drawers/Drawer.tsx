'use client'

import type { ComponentProps, ComponentPropsWithoutRef, ComponentRef, HTMLAttributes, RefObject } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { cn } from '~/utils/cn'

function Drawer({
  shouldScaleBackground = true,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  )
}
Drawer.displayName = 'Drawer'

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

function DrawerOverlay({ ref, className, ...props }: ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay> & { ref?: RefObject<ComponentRef<typeof DrawerPrimitive.Overlay>> }) {
  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn('fixed inset-0 z-50 bg-black/80', className)}
      {...props}
    />
  )
}
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

function DrawerContent({ ref, className, children, ...props }: ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & { ref?: RefObject<ComponentRef<typeof DrawerPrimitive.Content>> }) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 px-5 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-1 w-9 rounded-full bg-gray-200" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}
DrawerContent.displayName = 'DrawerContent'

function DrawerHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('grid gap-1.5 py-4 text-center sm:text-left', className)}
      {...props}
    />
  )
}
DrawerHeader.displayName = 'DrawerHeader'

function DrawerFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}
DrawerFooter.displayName = 'DrawerFooter'

function DrawerTitle({ ref, className, ...props }: ComponentPropsWithoutRef<typeof DrawerPrimitive.Title> & { ref?: RefObject<ComponentRef<typeof DrawerPrimitive.Title>> }) {
  return (
    <DrawerPrimitive.Title
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  )
}
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

function DrawerDescription({ ref, className, ...props }: ComponentPropsWithoutRef<typeof DrawerPrimitive.Description> & { ref?: RefObject<ComponentRef<typeof DrawerPrimitive.Description>> }) {
  return (
    <DrawerPrimitive.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
