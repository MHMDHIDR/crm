import { cn } from '@/lib/cn'
import { Skeleton } from './skeleton'

type LoadingCardProps = {
  className?: string
  /** The number of skeletons to render */
  renderedSkeletons?: number
}

/**
 *
 * @param className - the class name of the component
 * @param renderedSkeletons - the number of skeletons to render
 * @returns a loading card component
 */
export function LoadingCard({ className, renderedSkeletons = 4 }: LoadingCardProps) {
  return renderedSkeletons ? (
    <div className='flex flex-col gap-y-2'>
      {Array.from({ length: renderedSkeletons }).map((_, index) => (
        <Skeleton key={index} className={cn(`w-full h-10`, className)} />
      ))}
    </div>
  ) : (
    <Skeleton className={cn(`w-full h-12`, className)} />
  )
}
