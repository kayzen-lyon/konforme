import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[12px] bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite]',
        'bg-[linear-gradient(90deg,var(--color-surface-2)_0%,var(--color-border)_50%,var(--color-surface-2)_100%)]',
        className
      )}
      {...props}
    />
  )
}
