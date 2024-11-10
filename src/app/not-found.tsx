import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { auth } from '@/auth'
import { NotFoundIcon } from '@/components/custom/icons'
import { Button } from '@/components/ui/button'

export default async function RootNotFound() {
  const session = await auth()
  const user = session?.user
  const notFoundTranslations = await getTranslations('notFound')

  return (
    <section>
      <div className='container flex flex-col items-center justify-center w-full min-h-screen px-6 py-20 mx-auto'>
        <div className='flex flex-col items-center max-w-lg mx-auto text-center'>
          <NotFoundIcon />

          <h1 className='mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl'>
            {notFoundTranslations('title')}
          </h1>
          <p className='mt-4 text-gray-500 dark:text-gray-400'>
            {notFoundTranslations('description')}
          </p>

          <div className='flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto'>
            <Link href='/' className='w-full cursor-pointer'>
              <Button type='button' variant={'pressable'}>
                {notFoundTranslations('buttons.home')}
              </Button>
            </Link>
            {user && (
              <Link href='/dashboard' className='w-full cursor-pointer'>
                <Button type='button' variant={'pressable'}>
                  {notFoundTranslations('buttons.dashboard')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
