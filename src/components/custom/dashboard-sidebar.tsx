'use client'

import { Frame, Settings2 } from 'lucide-react'
import { NavMain } from '@/components/nav-main'
import { NavPinned } from '@/components/nav-pinned'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { UserSession } from '@/db/schema'

export function DashboardSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserSession }) {
  const sidebarItems = {
    teams: [
      {
        name: `${user.name}`,
        logo: '/images/logo.svg',
        plan: 'Enterprise'
      }
    ],
    pinned: [
      {
        name: 'Design Engineering',
        url: '#',
        icon: Frame
      }
    ],
    navMain: [
      {
        title: 'Settings',
        url: '#',
        icon: Settings2,
        items: [
          {
            title: 'Account',
            url: '/dashboard/account'
          }
        ]
      }
    ]
  }

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarItems.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavPinned pinned={sidebarItems.pinned} />
        <NavMain items={sidebarItems.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
