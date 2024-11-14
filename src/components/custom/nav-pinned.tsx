'use client'

import { PinIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import type { LucideIcon } from 'lucide-react'

export function NavPinned({
  pinned
}: {
  pinned: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const navMenuTranslations = useTranslations('DashboardSidebar.labels')

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel className='flex gap-x-1.5 select-none'>
        <span>{navMenuTranslations('pinned.title')}</span>
        <PinIcon className='rotate-45' />
      </SidebarGroupLabel>
      <SidebarMenu>
        {pinned.map(item => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
