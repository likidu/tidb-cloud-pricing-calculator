import * as React from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '../../lib/utils/cn'

export const TooltipProvider = RadixTooltip.Provider
export const Tooltip = RadixTooltip.Root
export const TooltipTrigger = RadixTooltip.Trigger

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof RadixTooltip.Content>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <RadixTooltip.Portal>
    <RadixTooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 rounded border border-border bg-white px-3 py-2 text-xs text-foreground shadow-md',
        className,
      )}
      {...props}
    />
  </RadixTooltip.Portal>
))
TooltipContent.displayName = 'TooltipContent'

