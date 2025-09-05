import * as React from 'react'
import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from '../../lib/utils/cn'

export type SwitchProps = React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>

export const Switch = React.forwardRef<
  React.ElementRef<typeof RadixSwitch.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <RadixSwitch.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border bg-gray-200 transition-colors',
      'data-[state=checked]:bg-foreground',
      className,
    )}
    {...props}
  >
    <RadixSwitch.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform',
        'data-[state=checked]:translate-x-5',
      )}
    />
  </RadixSwitch.Root>
))
Switch.displayName = 'Switch'
