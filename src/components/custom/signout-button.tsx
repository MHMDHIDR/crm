'use client'

import { LogOutIcon } from 'lucide-react'
import { handleSignout } from '@/actions/handle-signout'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  return (
    <Button onClick={handleSignout} className='w-fit'>
      <LogOutIcon className='h-5 w-5 text-red-500' />
      <span className='hidden sm:inline-flex'>Sign Out</span>
    </Button>
  )
}
