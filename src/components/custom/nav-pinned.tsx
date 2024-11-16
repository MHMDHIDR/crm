'use client'

import { PinIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Collapsible } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink
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
    <SidebarGroup>
      <SidebarGroupLabel className='flex gap-x-1.5 select-none'>
        <span>{navMenuTranslations('pinned.title')}</span>
        <PinIcon className='rotate-45' />
      </SidebarGroupLabel>
      <SidebarMenu>
        {pinned.map(item => (
          <Collapsible
            key={item.name}
            defaultOpen={item.url === '/dashboard'}
            className='group/collapsible'
            asChild
          >
            <SidebarMenuItem>
              <SidebarMenuLink tooltip={item.name} key={item.name} href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuLink>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
