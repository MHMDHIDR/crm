import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type ActiveProject = {
  id: string
  name: string
  logo: string
  plan: string
}

export function useActiveProject(projects: ActiveProject[]) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get active project from URL or default to first project
  const getInitialProject = useCallback(() => {
    if (!projects || projects.length === 0) {
      return null
    }

    const projectId = searchParams.get('projectId')
    if (projectId) {
      const foundProject = projects.find(p => p.id === projectId)
      if (foundProject) {
        return foundProject
      }
    }

    // If we're on a project-specific page, try to match the project from the URL
    const pathSegments = pathname.split('/')
    const projectIdFromPath = pathSegments[pathSegments.indexOf('projects') + 1]
    if (projectIdFromPath) {
      const foundProject = projects.find(p => p.id === projectIdFromPath)
      if (foundProject) {
        return foundProject
      }
    }

    return projects[0]
  }, [projects, searchParams, pathname])

  const [activeProject, setActiveProjectState] = useState<ActiveProject | null>(() =>
    getInitialProject()
  )

  // Update URL when active project changes
  const setActiveProject = useCallback(
    (project: ActiveProject) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('projectId', project.id)

      // Update URL without reloading the page
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
      setActiveProjectState(project)
    },
    [pathname, router, searchParams]
  )

  // Keep state in sync with URL and path changes
  useEffect(() => {
    const newActiveProject = getInitialProject()
    if (newActiveProject && (!activeProject || newActiveProject.id !== activeProject.id)) {
      setActiveProjectState(newActiveProject)
    }
  }, [searchParams, pathname, getInitialProject, activeProject])

  return {
    activeProject: activeProject || projects[0],
    setActiveProject
  }
}
