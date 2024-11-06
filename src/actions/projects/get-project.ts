'use server'

import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { database } from '@/db'
import { clients, projects, users } from '@/db/schema'
import type { Client, ExtendedProject, Project, User } from '@/db/schema'

type ProjectWithRelations = Project & {
  assignedEmployee: User | null
  client: Client | null
}

/**
 * Fetch all projects from the database
 * @returns Promise<{ success: boolean; data?: ExtendedProject[]; error?: string }>
 */
export async function getProjects(): Promise<{
  success: boolean
  data?: ExtendedProject[]
  error?: string
}> {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: 'You must be logged in to fetch projects' }
    }

    const role = session.user.role

    let projectsWithRelations: ProjectWithRelations[] = []

    if (role === 'Admin') {
      projectsWithRelations = await database.query.projects.findMany({
        with: { assignedEmployee: true, client: true },
        orderBy: (projects, { desc }) => [desc(projects.updatedAt)]
      })
    } else {
      projectsWithRelations = await database.query.projects.findMany({
        with: { assignedEmployee: true, client: true },
        orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
        where: eq(projects.assignedEmployeeId, session.user.id)
      })
    }

    // Transform the data to match ExtendedProject type
    const extendedProjects: ExtendedProject[] = projectsWithRelations.map(project => ({
      ...project,
      assignedEmployeeName: project.assignedEmployee?.name ?? 'Unassigned',
      clientName: project.client?.name ?? 'No Client'
    }))

    return { success: true, data: extendedProjects }
  } catch (error) {
    return { success: false, error: 'Failed to fetch projects' }
  }
}

/**
 * Fetch a single project by ID from the database
 * @param projectId The ID of the project to fetch
 * @returns Promise<{ success: boolean; data?: ExtendedProject; error?: string }>
 */
export async function getProjectById(
  projectId: Project['id']
): Promise<{ success: boolean; data?: ExtendedProject; error?: string }> {
  try {
    const projectWithRelations = await database.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        assignedEmployee: true,
        client: true
      }
    })

    if (!projectWithRelations) {
      return { success: false, error: 'Project not found' }
    }

    const extendedProject: ExtendedProject = {
      ...projectWithRelations,
      assignedEmployeeName: projectWithRelations.assignedEmployee?.name ?? 'Unassigned',
      clientName: projectWithRelations.client?.name ?? 'No Client'
    }

    return { success: true, data: extendedProject }
  } catch (error) {
    return { success: false, error: 'Failed to fetch project' }
  }
}

/**
 * Fetch projects for a specific employee
 * @param employeeId ID of the employee to fetch projects for
 * @returns Promise<ExtendedProject[] | null>
 */
export async function getProjectsByEmployeeId(
  employeeId: Project['assignedEmployeeId']
): Promise<ExtendedProject[] | null> {
  try {
    if (!employeeId) return null

    const projectsWithRelations = await database.query.projects.findMany({
      where: eq(projects.assignedEmployeeId, employeeId),
      with: {
        assignedEmployee: true,
        client: true
      }
    })

    const extendedProjects: ExtendedProject[] = projectsWithRelations.map(project => ({
      ...project,
      assignedEmployeeName: project.assignedEmployee?.name ?? 'Unassigned',
      clientName: project.client?.name ?? 'No Client'
    }))

    return extendedProjects
  } catch {
    return null
  }
}
