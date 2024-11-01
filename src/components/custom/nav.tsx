'use client'

import { Briefcase, MenuIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Navbar */}
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
          <Link href='/auth/signin'>
            <Button>Sign in</Button>
          </Link>
          <button className='ml-auto md:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='fixed inset-0 z-50 bg-background md:hidden'>
          <div className='container flex flex-col items-center justify-center h-full space-y-6'>
            <Link href='#features' onClick={() => setIsMenuOpen(false)}>
              Features
            </Link>
            <Link href='#pricing' onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Button onClick={() => setIsMenuOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </>
  )
}
