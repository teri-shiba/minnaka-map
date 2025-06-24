'use client'

import { cn } from '~/utils/utils'
import { Button } from '../buttons/Button'

import { Input } from './Input'
import { Label } from './Label'

export default function DeleteAccountForm({ className }: React.ComponentProps<'form'>) {
  return (
    <form className={cn('grid items-start gap-4', className)}>
      <div className="grid gap-4">
        <Label htmlFor="email" className="text-xs font-normal text-gray-500">ヒント：sam***@*****</Label>
        <Input type="email" id="email" className="h-auto py-3 focus-visible:ring-destructive" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto border border-destructive bg-white py-3 text-destructive hover:bg-white hover:text-destructive">キャンセル</Button>
        <Button variant="destructive" className="h-auto py-3">
          削除する
        </Button>
      </div>
    </form>
  )
}
