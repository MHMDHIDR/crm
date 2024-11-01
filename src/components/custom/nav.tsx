import { Briefcase, MenuIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserSession } from '@/db/schema'

export default async function Nav() {
  const session = await auth()

  const user = session?.user as UserSession

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-14 items-center px-4'>
        <div className='mr-4 hidden md:flex flex-1'>
          <Link className='mr-6 flex items-center space-x-2' href='/'>
            <Briefcase className='h-6 w-6' />
            <span className='hidden font-bold sm:inline-block'>CRM Pro</span>
          </Link>
          <nav className='flex items-center space-x-6 text-sm font-medium'>
            <Link href='#features'>Features</Link>
            <Link href='#pricing'>Pricing</Link>
          </nav>
        </div>

        {user ? (
          <Link href='/dashboard'>
            <Button className='w-full'>Dashboard</Button>
          </Link>
        ) : (
          <Link href='/auth/signin'>
            <Button className='w-full'>Sign in</Button>
          </Link>
        )}

        {/* Mobile Menu Toggle */}
        <div className='relative ml-auto md:hidden'>
          <input
            type='checkbox'
            id='mobile-menu'
            className='absolute top-0 right-0 cursor-pointer peer min-w-6 min-h-6 opacity-0 z-50'
            aria-label='Toggle mobile menu'
          />
          <label htmlFor='mobile-menu' className='cursor-pointer'>
            <MenuIcon className='peer-checked:hidden h-6 w-6' />
          </label>

          {/* Overlay */}
          <div className='fixed inset-0 min-w-[100vw] min-h-dvh bg-black/70 transition-opacity duration-300 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible md:hidden z-40' />

          {/* Mobile Menu Content */}
          <div className='fixed top-0 left-0 h-screen w-[85%] bg-white dark:bg-gray-900 shadow-lg transform -translate-x-full transition-transform duration-300 ease-in-out peer-checked:translate-x-0 md:hidden z-50'>
            <div className='relative h-full p-6'>
              {/* Close Button */}
              <label htmlFor='mobile-menu' className='absolute top-4 right-4 cursor-pointer'>
                <XIcon className='h-6 w-6' />
              </label>

              {/* Menu Content */}
              <div className='flex flex-col space-y-6 mt-16'>
                <Link href='/' className='flex items-center space-x-2 mb-8'>
                  <Briefcase className='h-6 w-6' />
                  <span className='font-bold'>CRM Pro</span>
                </Link>
                <Link
                  href='#features'
                  className='text-lg font-medium hover:text-primary transition-colors'
                >
                  Features
                </Link>
                <Link
                  href='#pricing'
                  className='text-lg font-medium hover:text-primary transition-colors'
                >
                  Pricing
                </Link>
                {user ? (
                  <Link href='/dashboard' className='mt-4'>
                    <Button className='w-full'>Dashboard</Button>
                  </Link>
                ) : (
                  <Link href='/auth/signin' className='mt-4'>
                    <Button className='w-full'>Sign in</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
