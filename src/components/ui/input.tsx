import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-12 w-full rounded-[16px] border border-border-strong bg-surface px-4 py-2 text-base text-text placeholder:text-text-dim',
        'transition-colors focus-visible:border-primary focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
