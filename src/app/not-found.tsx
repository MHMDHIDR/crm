import Link from 'next/link'
import { NotFoundIcon } from '@/components/custom/icons'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className={`p-4 py-20`}>
      <div className='container flex flex-col justify-center items-center px-6 py-20 mx-auto w-full min-h-screen'>
        <div className='flex flex-col items-center mx-auto max-w-lg text-center'>
          <NotFoundIcon />

          <h1 className='mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl'>
            Page Not Found
          </h1>
          <p className='mt-4 text-gray-500 dark:text-gray-400'>
            Sorry, the page you are looking for does not exist or has been moved.
          </p>

          <div className='flex gap-x-3 items-center mt-6 w-full shrink-0 sm:w-auto'>
            <Link href='/' className='w-full cursor-pointer'>
              <Button type='button' variant={'confirm'}>
                Go Back Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
