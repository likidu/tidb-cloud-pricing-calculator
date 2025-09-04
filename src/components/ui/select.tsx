import * as React from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils/cn'

export const Select = RadixSelect.Root
export const SelectGroup = RadixSelect.Group
export const SelectValue = RadixSelect.Value

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      'inline-flex h-10 w-full items-center justify-between rounded border border-border bg-white px-3 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-ring',
      className,
    )}
    {...props}
  >
    {children}
    <RadixSelect.Icon>
      <ChevronDown className='ml-2 h-4 w-4 opacity-60' />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
))
SelectTrigger.displayName = RadixSelect.Trigger.displayName

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded border border-border bg-white text-foreground shadow-md',
        className,
      )}
      position='popper'
      {...props}
    >
      <RadixSelect.Viewport className='p-1'>{children}</RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
))
SelectContent.displayName = RadixSelect.Content.displayName

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Label>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Label>
>(({ className, ...props }, ref) => (
  <RadixSelect.Label ref={ref} className={cn('px-2 py-1.5 text-sm font-medium', className)} {...props} />
))
SelectLabel.displayName = RadixSelect.Label.displayName

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded px-8 py-2 text-sm outline-none',
      'focus:bg-gray-100',
      className,
    )}
    {...props}
  >
    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
      <RadixSelect.ItemIndicator>
        <Check className='h-4 w-4' />
      </RadixSelect.ItemIndicator>
    </span>
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
))
SelectItem.displayName = RadixSelect.Item.displayName

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Separator>
>(({ className, ...props }, ref) => (
  <RadixSelect.Separator ref={ref} className={cn('my-1 h-px bg-gray-200', className)} {...props} />
))
SelectSeparator.displayName = RadixSelect.Separator.displayName
