'use server'

import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { database } from '@/db'
import { clients } from '@/db/schema'
import type { Client } from '@/db/schema'

/**
 * Fetch all clients from the database
 * @returns    Promise<{ success: boolean; data?: Client[]; error?: string }>
 */
export async function getClients(): Promise<{ success: boolean; data?: Client[]; error?: string }> {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: 'You must be logged in to fetch clients' }
    }

    const role = session.user.role

    let allClients: Client[] = []

    if (role === 'Admin') {
      allClients = await database.query.clients.findMany({
        orderBy: (clients, { desc }) => [desc(clients.email)]
      })
    } else {
      allClients = await database.query.clients.findMany({
        orderBy: (clients, { desc }) => [desc(clients.email)],
        where: eq(clients.assignedEmployeeId, session.user.id)
      })
    }

    return { success: true, data: allClients }
  } catch (error) {
    return { success: false, error: 'Failed to fetch clients' }
  }
}

/**
 * Fetch a single client by email from the database
 * @param email   Email address of the client
 * @returns        Promise<Client | null>
 */
export async function getClientByEmail(email: string): Promise<Client | null> {
  try {
    const client = await database.query.clients.findFirst({ where: eq(clients.email, email) })

    return client || null
  } catch {
    return null
  }
}

/**
 * Fetch a single client by ID from the database
 * @returns    Promise<{ success: boolean; data?: Client[]; error?: string }>
 */
export async function getClientById(
  clientId: Client['id']
): Promise<{ success: boolean; data?: Client; error?: string }> {
  try {
    const client = await database.query.clients.findFirst({
      where: eq(clients.id, clientId)
    })

    return { success: true, data: client }
  } catch (error) {
    return { success: false, error: 'Failed to fetch clients' }
  }
}

/**
 * Fetch clients for a spcecific employee, this gets all the clients that are related
 * to a specific employee using  assignedEmployeeId in clients table
 * @param employeeId   ID of the employee to fetch clients for
 * @returns            Promise<Client[]>
 */
export async function getClientsByEmployeeId(
  employeeId: Client['assignedEmployeeId']
): Promise<Client[] | null> {
  try {
    if (employeeId === null) return null

    const clientsByEmployeeId = await database.query.clients.findMany({
      where: eq(clients.assignedEmployeeId, employeeId)
    })

    return clientsByEmployeeId
  } catch {
    return null
  }
}
