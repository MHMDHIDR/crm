'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
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
    if (!supervisorId) {
      throw new Error('Supervisor ID is required')
    }

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

    const employeeResult = await database
      .select({ totalEmployees: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.supervisorId, supervisorId), eq(users.role, 'Employee')))

    const projectResult = await database
      .select({ totalProjects: sql<number>`count(*)::int` })
      .from(projects)
      .where(inArray(projects.assignedEmployeeId, employeeIds))

    const taskResult = await database
      .select({ totalTasks: sql<number>`count(*)::int` })
      .from(tasks)
      .where(inArray(tasks.assignedEmployeeId, employeeIds))

    const clientResult = await database
      .select({ totalClients: sql<number>`count(*)::int` })
      .from(clients)
      .where(inArray(clients.assignedEmployeeId, employeeIds))

    return {
      success: true,
      data: {
        totalEmployees: employeeResult[0]?.totalEmployees ?? 0,
        totalProjects: projectResult[0]?.totalProjects ?? 0,
        totalTasks: taskResult[0]?.totalTasks ?? 0,
        totalClients: clientResult[0]?.totalClients ?? 0
      }
    }
  } catch (error) {
    console.error('Error fetching supervisor stats:', error)
    return { success: false, error: 'Failed to fetch supervisor stats' }
  }
}
