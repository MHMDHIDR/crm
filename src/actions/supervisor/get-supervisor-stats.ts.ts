'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { database } from '@/db'
import { clients, projects, sessions, tasks, users } from '@/db/schema'

export type ActiveEmployee = {
  id: string
  name: string
  signedInAt: Date
}

export type SupervisorStats = {
  totalEmployees: number
  totalProjects: number
  totalTasks: number
  totalClients: number
}

export async function getActiveEmployees(supervisorId: string): Promise<{
  success: boolean
  data?: ActiveEmployee[]
  error?: string
}> {
  try {
    const activeSessions = await database
      .select({
        id: users.id,
        name: users.name,
        signedInAt: sessions.createdAt
      })
      .from(users)
      .innerJoin(sessions, eq(sessions.userId, users.id))
      .where(and(eq(users.supervisorId, supervisorId), eq(users.role, 'Employee')))

    return { success: true, data: activeSessions }
  } catch (error) {
    return { success: false, error: 'Failed to fetch active employees' }
  }
}

export async function getSupervisorEmployeeStats(supervisorId: string): Promise<{
  success: boolean
  data?: SupervisorStats
  error?: string
}> {
  try {
    const session = await auth()
    if (!session) {
      throw new Error('Unauthorized')
    }

    const userRole = session.user.role

    if (userRole === 'Admin') {
      const [[employeeResult], [projectResult], [taskResult], [clientResult]] = await Promise.all([
        database
          .select({ totalEmployees: sql<number>`count(*)::int` })
          .from(users)
          .where(eq(users.role, 'Employee')),

        database.select({ totalProjects: sql<number>`count(*)::int` }).from(projects),

        database.select({ totalTasks: sql<number>`count(*)::int` }).from(tasks),

        database.select({ totalClients: sql<number>`count(*)::int` }).from(clients)
      ])

      return {
        success: true,
        data: {
          totalEmployees: employeeResult.totalEmployees,
          totalProjects: projectResult.totalProjects,
          totalTasks: taskResult.totalTasks,
          totalClients: clientResult.totalClients
        }
      }
    }

    if (userRole === 'Supervisor' && supervisorId) {
      const employeesUnderSupervisor = await database
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.supervisorId, supervisorId), eq(users.role, 'Employee')))

      const employeeIds = employeesUnderSupervisor.map(emp => emp.id)
      if (employeeIds.length === 0) {
        return {
          success: true,
          data: { totalEmployees: 0, totalProjects: 0, totalTasks: 0, totalClients: 0 }
        }
      }

      const [[employeeResult], [projectResult], [taskResult], [clientResult]] = await Promise.all([
        await database
          .select({ totalEmployees: sql<number>`count(*)::int` })
          .from(users)
          .where(and(eq(users.supervisorId, supervisorId), eq(users.role, 'Employee'))),

        await database
          .select({ totalProjects: sql<number>`count(*)::int` })
          .from(projects)
          .where(inArray(projects.assignedEmployeeId, employeeIds)),

        await database
          .select({ totalTasks: sql<number>`count(*)::int` })
          .from(tasks)
          .where(inArray(tasks.assignedEmployeeId, employeeIds)),

        await database
          .select({ totalClients: sql<number>`count(*)::int` })
          .from(clients)
          .where(inArray(clients.assignedEmployeeId, employeeIds))
      ])

      return {
        success: true,
        data: {
          totalEmployees: employeeResult.totalEmployees,
          totalProjects: projectResult.totalProjects,
          totalTasks: taskResult.totalTasks,
          totalClients: clientResult.totalClients
        }
      }
    }

    throw new Error('Unauthorized or invalid role')
  } catch (error) {
    console.error('Error fetching supervisor stats:', error)
    return { success: false, error: 'Failed to fetch supervisor stats' }
  }
}
