import { cn } from '@/lib/cn'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-md animate-pulse bg-primary/10', className)} {...props} />
}

export { Skeleton }
