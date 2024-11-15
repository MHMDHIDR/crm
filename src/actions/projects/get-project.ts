'use server'

import { and, eq, sql } from 'drizzle-orm'
import { getClientsByEmployeeId } from '@/actions/clients/get-clients'
import { auth } from '@/auth'
import { database } from '@/db'
import { projects } from '@/db/schema'
import type { Client, ExtendedProject, Project, User } from '@/db/schema'

type ProjectWithRelations = Project & {
  assignedEmployee: User | null
  client: Client | null
}

/**
 * Fetch all projects from the database
 * @returns Promise<{ success: boolean; data?: ExtendedProject[]; error?: string }>
 */
export async function getProjects(projectId?: Project['id']): Promise<{
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

    const { count: clientCount } = await getClientsByEmployeeId(session.user.id)

    if ((!clientCount || !clientCount) && role !== 'Admin') {
      return { success: false, error: 'no clients' }
    }

    let projectsWithRelations: ProjectWithRelations[] = []

    // if role is Admin, fetch all projects, else fetch only the projects assigned to the employee
    if (role === 'Admin') {
      projectId
        ? (projectsWithRelations = await database.query.projects.findMany({
            with: { assignedEmployee: true, client: true },
            where: eq(projects.id, projectId)
          }))
        : (projectsWithRelations = await database.query.projects.findMany({
            with: { assignedEmployee: true, client: true },
            orderBy: (projects, { desc }) => [desc(projects.updatedAt)]
          }))
    } else {
      projectId
        ? (projectsWithRelations = await database.query.projects.findMany({
            with: { assignedEmployee: true, client: true },
            where: and(eq(projects.id, projectId), eq(projects.assignedEmployeeId, session.user.id))
          }))
        : (projectsWithRelations = await database.query.projects.findMany({
            with: { assignedEmployee: true, client: true },
            orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
            where: eq(projects.assignedEmployeeId, session.user.id)
          }))
    }

    // Transform the data to match ExtendedProject type
    const extendedProjects: ExtendedProject[] = projectsWithRelations.map(project => ({
      ...project,
      assignedEmployeeName: project.assignedEmployee?.name ?? 'Unassigned',
      clientName: project.client?.name ?? 'No Client'
    }))

    if (!extendedProjects.length) {
      return { success: false, error: 'no projects' }
    }

    return { success: true, data: extendedProjects }
  } catch (error) {
    return { success: false, error: 'no projects' }
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
): Promise<{ projectsByEmployeeId: ExtendedProject[] | null; count: number }> {
  try {
    if (!employeeId) return { projectsByEmployeeId: null, count: 0 }

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

    const [{ count }] = await database
      .select({ count: sql`count(*)` })
      .from(projects)
      .where(eq(projects.assignedEmployeeId, employeeId))

    return { projectsByEmployeeId: extendedProjects, count: Number(count) }
  } catch {
    return { projectsByEmployeeId: null, count: 0 }
  }
}
