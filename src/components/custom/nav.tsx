import { Briefcase, MenuIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserSession } from '@/db/schema'
import { Link } from '@/i18n/routing'
import { SignOutButton } from './signout-button'

export default function Nav({ user }: { user: UserSession }) {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex items-center px-4 mx-auto h-14'>
        <div className='flex-1 hidden mr-4 md:flex'>
          <Link className='flex items-center mr-6 space-x-2' href='/'>
            <Briefcase className='w-6 h-6' />
            <span className='hidden font-bold sm:inline-block'>CRM Pro</span>
          </Link>
          <nav className='flex items-center text-sm font-medium space-x-6'>
            <Link href='#features'>Features</Link>
            <Link href='#pricing'>Pricing</Link>
          </nav>
        </div>

        <div className='flex gap-2'>
          <Link href={user ? '/dashboard' : '/auth/signin'}>
            <Button>{user ? 'Dashboard' : 'Sign in'}</Button>
          </Link>
          {user && <SignOutButton />}
        </div>

        {/* Mobile Menu Toggle */}
        <div className='relative ml-auto md:hidden'>
          <input
            type='checkbox'
            id='mobile-menu'
            className='absolute top-0 right-0 z-50 opacity-0 cursor-pointer peer min-w-6 min-h-6'
            aria-label='Toggle mobile menu'
          />
          <label htmlFor='mobile-menu' className='cursor-pointer'>
            <MenuIcon className='w-6 h-6 peer-checked:hidden' />
          </label>

          {/* Overlay */}
          <div className='fixed inset-0 min-w-[100vw] min-h-dvh bg-black/70 transition-opacity duration-300 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible md:hidden z-40' />

          {/* Mobile Menu Content */}
          <div className='fixed top-0 left-0 h-screen w-[85%] bg-white dark:bg-gray-900 shadow-lg transform -translate-x-full transition-transform duration-300 ease-in-out peer-checked:translate-x-0 md:hidden z-50'>
            <div className='relative h-full p-6'>
              {/* Close Button */}
              <label htmlFor='mobile-menu' className='absolute cursor-pointer top-4 right-4'>
                <XIcon className='w-6 h-6' />
              </label>

              {/* Menu Content */}
              <div className='flex flex-col mt-16 space-y-6'>
                <Link href='/' className='flex items-center mb-8 space-x-2'>
                  <Briefcase className='w-6 h-6' />
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

                <Link href={user ? '/dashboard' : '/auth/signin'} className='mt-4'>
                  <Button>{user ? 'Dashboard' : 'Sign in'}</Button>
                </Link>
                {user && <SignOutButton />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
