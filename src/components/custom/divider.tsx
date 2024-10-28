import { cn } from '@/lib/utils'

export function Divider({ children, className }: { children?: string; className?: string }) {
  return (
    <div
      className={cn(
        `flex relative w-full justify-center items-center m-4 before:[background:linear-gradient(90deg,transparent,#777,transparent)] dark:before:[background:linear-gradient(90deg,transparent,#999,transparent)] before:absolute before:left-0 before:top-1/2 before:w-full before:h-px`,
        className
      )}
    >
      {children ? (
        <span className='z-10 px-2 bg-white dark:text-neutral-200 dark:bg-gray-800'>
          {children}
        </span>
      ) : null}
    </div>
  )
}

export default Divider
