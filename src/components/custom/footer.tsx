import { Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className='w-full py-6 bg-gray-100 dark:bg-neutral-800 dark:text-white'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
          <div className='flex items-center gap-2'>
            <Briefcase className='h-6 w-6' />
            <span className='font-bold'>CRM Pro</span>
          </div>
          <nav className='flex gap-4 sm:gap-6'>
            <Link className='text-sm hover:underline underline-offset-4' href='#'>
              Terms of Service
            </Link>
            <Link className='text-sm hover:underline underline-offset-4' href='#'>
              Privacy Policy
            </Link>
          </nav>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            © 2024 CRM Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
