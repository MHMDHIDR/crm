'use client'

import { ChevronsUpDown, Plus } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useActiveProject } from '@/hooks/use-active-project'

type ProjectSwitcherProps = {
  teams: {
    id: string
    name: string
    logo: string
    plan: string
  }[]
}

export function ProjectSwitcher({ teams }: ProjectSwitcherProps) {
  const { isMobile } = useSidebar()
  const { activeProject, setActiveProject } = useActiveProject(teams)

  // If there are no teams, don't render anything
  return !teams || teams.length === 0 ? null : (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              {activeProject ? (
                <>
                  <div className='flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground'>
                    <Image
                      src={activeProject.logo}
                      alt={activeProject.name}
                      width={16}
                      height={16}
                      className='size-4'
                    />
                  </div>
                  <div className='flex-1 text-sm leading-tight text-left grid'>
                    <span className='font-semibold truncate'>{activeProject.name}</span>
                    <span className='text-xs truncate'>{activeProject.plan}</span>
                  </div>
                  <ChevronsUpDown className='ml-auto' />
                </>
              ) : (
                <div>No Project Selected</div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg space-y-1'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Active Projects
            </DropdownMenuLabel>
            {teams.map(team => (
              <DropdownMenuLink
                key={team.id}
                onClick={() => setActiveProject(team)}
                className={`p-2 gap-2 hover:cursor-pointer ${activeProject?.id === team.id ? 'bg-accent' : ''}`}
                href={`/dashboard/projects/${team.id}`}
              >
                <div className='flex items-center justify-center border rounded-sm size-6'>
                  <Image
                    src={team.logo}
                    alt={team.name}
                    width={16}
                    height={16}
                    className='size-4'
                  />
                </div>
                {team.name}
              </DropdownMenuLink>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className='p-2 gap-2'>
              <div className='flex items-center justify-center border rounded-md size-6 bg-background'>
                <Plus className='size-4' />
              </div>
              <DropdownMenuLink
                className='p-0 hover:cursor-pointer'
                href={`/dashboard/create-project`}
              >
                Add Project
              </DropdownMenuLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
