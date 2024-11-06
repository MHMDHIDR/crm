'use client'

import {
  FileUser,
  Frame,
  Group,
  PackagePlusIcon,
  Paintbrush2,
  PersonStanding,
  Settings2,
  ShoppingBagIcon,
  SquareDashedMousePointer,
  UserCog,
  UserPlus2,
  Users2
} from 'lucide-react'
import { NavMain } from '@/components/custom/nav-main'
import { NavPinned } from '@/components/custom/nav-pinned'
import { NavUser } from '@/components/custom/nav-user'
import { TeamSwitcher } from '@/components/custom/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar'
import { UserSession } from '@/db/schema'

export function DashboardSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserSession }) {
  const { open } = useSidebar()

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
      // Only include the "Users" section if the user role === "Admin"
      ...(user.role === 'Admin'
        ? [
            {
              title: 'Users',
              url: open ? '' : '/dashboard/users',
              icon: Users2,
              items: [
                {
                  title: 'All Users',
                  url: '/dashboard/users',
                  icon: Group
                },
                {
                  title: 'Create User',
                  url: '/dashboard/create-user',
                  icon: UserPlus2
                }
              ]
            }
          ]
        : []),
      {
        title: 'Projects',
        url: open ? '' : '/dashboard/projects',
        icon: ShoppingBagIcon,
        items: [
          {
            title: 'All Projects',
            url: '/dashboard/projects',
            icon: SquareDashedMousePointer
          },
          {
            title: 'Create New project',
            url: '/dashboard/create-project',
            icon: PackagePlusIcon
          }
        ]
      },
      {
        title: 'Clients',
        url: open ? '' : '/dashboard/clients',
        icon: FileUser,
        items: [
          {
            title: 'All Clients',
            url: '/dashboard/clients',
            icon: Group
          },
          {
            title: 'Create New Client',
            url: '/dashboard/create-client',
            icon: PersonStanding
          }
        ]
      },
      {
        title: 'Settings',
        url: open ? '' : '/dashboard/account',
        icon: Settings2,
        items: [
          {
            title: 'Account',
            url: '/dashboard/account',
            icon: UserCog
          },
          {
            title: 'Preferences',
            url: '/dashboard/preferences',
            icon: Paintbrush2
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
