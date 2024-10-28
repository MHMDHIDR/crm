import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-md animate-pulse bg-white/30 dark:bg:gray-800', className)}
      {...props}
    />
  )
}
