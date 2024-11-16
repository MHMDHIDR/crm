'use client'

import { BadgeCheck, ChevronsUpDown, LogOut, Paintbrush2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { addEvent } from '@/actions/events/add-event'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { fallbackUsername } from '@/lib/fallback-username'
import type { UserSession } from '@/db/schema'

export function NavUser({ user }: { user: UserSession }) {
  const { isMobile } = useSidebar()

  const handleSignout = async () => {
    await addEvent(`${user?.name || user?.email} signed out`)
    await signOut({ redirectTo: '/auth/signin' })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='w-8 h-8 rounded-lg'>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className='rounded-lg'>
                  {fallbackUsername(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 text-sm leading-tight text-left grid'>
                <span className='font-semibold truncate'>{user.name}</span>
                <span className='text-xs truncate'>{user.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuGroup className='flex items-center p-0.5 text-sm text-left gap-2'>
              <DropdownMenuLink href={`/dashboard/users/${user.id}`} className='min-w-full'>
                <Avatar className='w-8 h-8 rounded-lg'>
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className='rounded-lg'>
                    {fallbackUsername(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 text-sm leading-tight text-left grid'>
                  <span className='font-semibold truncate'>{user.name}</span>
                  <span className='text-xs truncate'>{user.email}</span>
                </div>
              </DropdownMenuLink>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLink href={'/dashboard/account'}>
                <BadgeCheck />
                Account
              </DropdownMenuLink>
              <DropdownMenuLink href={'/dashboard/preferences'}>
                <Paintbrush2 />
                Preferences
              </DropdownMenuLink>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignout}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
