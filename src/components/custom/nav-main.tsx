'use client'

import { ChevronRight, Link2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ReactElement } from 'react'
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

type IconType = LucideIcon | ReactElement

export function NavMain({
  items
}: {
  items: {
    title: string
    url: string
    icon?: IconType
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: IconType
    }[]
  }[]
}) {
  const { openMobile, setOpenMobile } = useSidebar()
  const navMenuTranslations = useTranslations('DashboardSidebar.labels')

  const renderIcon = (icon: IconType): React.ReactNode => {
    if (!icon) return null

    // If icon is a LucideIcon component
    if ('render' in icon) {
      const Icon = icon as LucideIcon
      return <Icon />
    }

    // If icon is a ReactElement (JSX)
    return icon as React.ReactNode
  }

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
                      {item.icon && renderIcon(item.icon)}
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
                              {subItem.icon && renderIcon(subItem.icon)}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuLink
                  tooltip={item.title}
                  href={item.url}
                  onClick={() => openMobile && setOpenMobile(false)}
                >
                  {item.icon && renderIcon(item.icon)}
                  <span>{item.title}</span>
                  <Link2Icon className='ml-auto rtl:rotate-180 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuLink>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
