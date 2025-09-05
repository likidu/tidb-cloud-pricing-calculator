import * as React from 'react'
import { cn } from '../../lib/utils/cn'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded bg-foreground px-4 text-sm font-medium text-white',
        'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

