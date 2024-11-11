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
import { useTranslations } from 'next-intl'
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
import { useLocale } from '@/providers/locale-provider'

export function DashboardSidebar({
  user,
  projects,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: UserSession
  projects: ExtendedProject[] | null
}) {
  const { open } = useSidebar()
  const { locale } = useLocale()
  const dashboardSidebarTranslations = useTranslations('DashboardSidebar')

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
              title: dashboardSidebarTranslations('users.title'),
              url: open ? '' : '/dashboard/users',
              icon: Users2,
              items: [
                {
                  title: dashboardSidebarTranslations('users.title'),
                  url: '/dashboard/users',
                  icon: Group
                },
                {
                  title: dashboardSidebarTranslations('users.createUser'),
                  url: '/dashboard/create-user',
                  icon: UserPlus2
                }
              ]
            }
          ]
        : []),
      {
        title: dashboardSidebarTranslations('projects.title'),
        url: open ? '' : '/dashboard/projects',
        icon: ShoppingBagIcon,
        items: [
          {
            title: dashboardSidebarTranslations('projects.title'),
            url: '/dashboard/projects',
            icon: SquareDashedMousePointer
          },
          {
            title: dashboardSidebarTranslations('projects.createProject'),
            url: '/dashboard/create-project',
            icon: PackagePlusIcon
          }
        ]
      },
      {
        title: dashboardSidebarTranslations('clients.title'),
        url: open ? '' : '/dashboard/clients',
        icon: FileUser,
        items: [
          {
            title: dashboardSidebarTranslations('clients.title'),
            url: '/dashboard/clients',
            icon: Group
          },
          {
            title: dashboardSidebarTranslations('clients.createClient'),
            url: '/dashboard/create-client',
            icon: PersonStanding
          }
        ]
      },
      {
        title: dashboardSidebarTranslations('settings.title'),
        url: open ? '' : '/dashboard/account',
        icon: Settings2,
        items: [
          {
            title: dashboardSidebarTranslations('settings.account'),
            url: '/dashboard/account',
            icon: UserCog
          },
          {
            title: dashboardSidebarTranslations('settings.preferences'),
            url: '/dashboard/preferences',
            icon: Paintbrush2
          }
        ]
      }
    ]
  }

  return (
    <Sidebar collapsible='icon' {...props} side={locale === 'en' ? 'left' : 'right'}>
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
