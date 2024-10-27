import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { PenBox } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { checkUser } from '@/lib/checkUser'
import { Button } from '../ui/button'
import UserMenu from './user-menu'

async function Header() {
  await checkUser()

  return (
    <nav className='mx-auto py-2 px-4 flex justify-between items-center shadow-md border-b-2'>
      <Link href='/' className='flex items-center'>
        <Image
          src='/logo.png'
          width='150'
          height='60'
          alt='Schedulrr Logo'
          className='h-16 w-auto'
        />
      </Link>

      <div className='flex items-center gap-4'>
        <Link href='/events?create=true'>
          <Button variant='default' className='flex items-center gap-2'>
            <PenBox size={18} />
            <span className='hidden sm:inline'>Create Event</span>
          </Button>
        </Link>
        <SignedOut>
          <SignInButton forceRedirectUrl='/dashboard'>
            <Button variant='outline'>Login</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserMenu />
        </SignedIn>
      </div>
    </nav>
  )
}

export default Header
