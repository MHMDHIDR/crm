'use client'

import { LogOutIcon } from 'lucide-react'
import { handleSignout } from '@/actions/auth/handle-signout'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  return (
    <Button onClick={handleSignout} className='w-fit'>
      <LogOutIcon className='w-5 h-5 text-red-500' />
      <span className='hidden sm:inline-flex'>Sign Out</span>
    </Button>
  )
}
