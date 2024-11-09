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
import { ProjectSwitcher } from '@/components/custom/project-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar'
import { ExtendedProject, UserSession } from '@/db/schema'

export function DashboardSidebar({
  user,
  projects,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: UserSession
  projects: ExtendedProject[] | null
}) {
  const { open } = useSidebar()

  const sidebarItems = {
    projects: [
      // If the user role === "Employee", Then show them their projects if they have any
      ...(user.role === 'Employee' && projects && projects.length > 0
        ? projects.map(project => ({
            id: project.id,
            name: project.name,
            logo: '/images/logo.svg',
            plan: `${project.clientName} | Project`
          }))
        : [])
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
        <ProjectSwitcher teams={sidebarItems.projects} />
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
