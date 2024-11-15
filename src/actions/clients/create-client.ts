'use server'

import { eq } from 'drizzle-orm'
import { addEvent } from '@/actions/events/add-event'
import { auth } from '@/auth'
import { database } from '@/db'
import { Client, clients } from '@/db/schema'
import type { ClientSchemaType } from '@/validators/client'

type CreateClientResult = { success: boolean; message: string }

export async function createClient(data: ClientSchemaType): Promise<CreateClientResult> {
  // Get the current assigned employee ID
  const session = await auth()
  if (!session?.user) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    // Check if email of the client is already in use
    const existingClient = await database
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.email, data.email))
      .limit(1)

    if (existingClient.length > 0) {
      return { success: false, message: 'Email is already in use, please use a different email' }
    }

    // Create the client record
    const [newClient]: Client[] = await database
      .insert(clients)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        assignedEmployeeId: session.user.id
      })
      .returning()
    const addedEvent = await addEvent(`Client ${newClient.name} created`)

    if (!newClient || !addedEvent.success) {
      return { success: false, message: 'Failed to create client' }
    }

    return {
      success: true,
      message: `${newClient.name} File has been Created Successfully 🎉.`
    }
  } catch (error) {
    console.error('Client creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create client. Please try again.'
    }
  }
}
