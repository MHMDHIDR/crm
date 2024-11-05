'use server'

import { database } from '@/db'
import type { ExtendedProject } from '@/db/schema'

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
    const allProjects = await database.query.projects.findMany({
      with: { assignedEmployee: true, client: true },
      orderBy: (projects, { desc }) => [desc(projects.updatedAt)]
    })

    // Transform the data to include assignedEmployeeName and clientName
    const extendedProjects: ExtendedProject[] = allProjects.map(project => ({
      ...project,
      assignedEmployeeName: project.assignedEmployee?.name,
      clientName: project.client?.name
    }))

    return { success: true, data: extendedProjects }
  } catch (error) {
    return { success: false, error: 'Failed to fetch projects' }
  }
}
