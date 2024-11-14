'use client'

import { ChevronRight, Link2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar'
import type { LucideIcon } from 'lucide-react'

export function NavMain({
  items
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const { openMobile, setOpenMobile } = useSidebar()
  const navMenuTranslations = useTranslations('DashboardSidebar.labels')

  return (
    <SidebarGroup>
      <SidebarGroupLabel className='select-none'>
        {navMenuTranslations('mainMenu')}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className='group/collapsible'
            asChild
          >
            <SidebarMenuItem>
              {item.items ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuLink tooltip={item.title} href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className='ml-auto rtl:rotate-180 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuLink>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            onClick={() => openMobile && setOpenMobile(false)}
                            asChild
                          >
                            <Link href={subItem.url}>
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : !item.items ? (
                <SidebarMenuLink
                  tooltip={item.title}
                  href={item.url}
                  onClick={() => openMobile && setOpenMobile(false)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <Link2Icon className='ml-auto rtl:rotate-180 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuLink>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
