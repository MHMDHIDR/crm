'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { getClientsByEmployeeId } from '@/actions/clients/get-clients'
import { auth } from '@/auth'
import { database } from '@/db'
import { projects, users } from '@/db/schema'
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
    const user = session?.user
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const role = user.role
    const userId = user.id

    // This is to get the client count of the Employee themselves
    const { count: clientCount } = await getClientsByEmployeeId(user.id)

    if (!clientCount && !['Admin', 'Supervisor'].includes(role)) {
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
    } else if (role === 'Supervisor') {
      // Get all employees under this supervisor
      const employeesUnderSupervisor = await database
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.supervisorId, userId), eq(users.role, 'Employee')))

      const employeeIds = employeesUnderSupervisor.map(emp => emp.id)

      if (employeeIds.length > 0) {
        // Get all projects assigned to these employees
        projectId
          ? (projectsWithRelations = await database.query.projects.findMany({
              with: { assignedEmployee: true, client: true },
              where: and(
                eq(projects.id, projectId),
                inArray(projects.assignedEmployeeId, employeeIds)
              )
            }))
          : (projectsWithRelations = await database.query.projects.findMany({
              with: { assignedEmployee: true, client: true },
              orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
              where: inArray(projects.assignedEmployeeId, employeeIds)
            }))
      }
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
    const session = await auth()
    const user = session?.user
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // First get the project with its relations
    const projectWithRelations = await database.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: { assignedEmployee: true, client: true }
    })

    if (!projectWithRelations) {
      return { success: false, error: 'Project not found' }
    }

    // Check access permissions
    const canAccess = async () => {
      // Admins and assigned employee can access all projects
      if (user.role === 'Admin' || projectWithRelations.assignedEmployeeId === user.id) return true

      // Check if user is the supervisor of the assignedEmployee
      const assignedEmployee = await database.query.users.findFirst({
        where: eq(users.id, projectWithRelations.assignedEmployeeId),
        columns: { supervisorId: true }
      })

      // User is the supervisor of the assigned employee
      if (assignedEmployee?.supervisorId === user.id) return true

      return false
    }
    const canAccessProject = await canAccess()

    if (!canAccessProject) {
      return { success: false, error: 'You do not have permission to view this project' }
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
