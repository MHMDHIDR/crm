import Image from 'next/image'

export default function EmptyState({
  children,
  isSmall
}: {
  isSmall?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isSmall ? 'gap-y-4 py-4' : 'gap-y-16 py-16'
      }`}
    >
      <Image
        alt='Empty State'
        height={isSmall ? 100 : 300}
        src='/images/empty-state.svg'
        width={isSmall ? 100 : 300}
      />

      {children ? children : <h3 className='text-lg font-semibold'>No data available</h3>}
    </div>
  )
}
