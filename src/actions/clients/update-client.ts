'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { addEvent } from '@/actions/events/add-event'
import { auth } from '@/auth'
import { database } from '@/db'
import { clients } from '@/db/schema'
import { clientSchema } from '@/validators/client'

type ExtendedClientInput = {
  id?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
  status?: 'active' | 'deactive' | null
  assignedEmployeeId?: string | null
}

/**
 * Update a Single Client in the database
 * @param values <ExtendedClientInput> - Client data to update
 * @returns Promise<{ success: string } | { error: string }> with success message or error
 */
export const updateClient = async (values: ExtendedClientInput) => {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Validate the input data
    const validatedData = clientSchema.parse({
      name: values.name,
      email: values.email,
      phone: values.phone,
      status: values.status
    })

    // Prepare fields to update
    const updates: Partial<ExtendedClientInput> = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      status: validatedData.status,
      assignedEmployeeId: values.assignedEmployeeId
    }

    // Filter out null or undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== null && value !== undefined)
    )

    if (Object.keys(filteredUpdates).length === 0) {
      return { success: false, message: 'No changes detected' }
    }

    // Update the client
    const [updatedClient] = await database
      .update(clients)
      .set(filteredUpdates)
      .where(eq(clients.id, values.id as string))
      .returning()

    if (!updatedClient) {
      return { success: false, message: 'Failed to update client' }
    }

    // Log the event
    const addedEvent = await addEvent(`Updated client ${updatedClient.name}.`)
    if (!addedEvent.success) {
      return { success: false, message: 'Failed to log event' }
    }

    return { success: true, message: 'Client Updated Successfully!' }
  } catch (error) {
    console.error('Error updating client:', error)

    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return { success: false, message: fieldErrors[0].message }
    }
    return { success: false, message: 'An error occurred while updating the client' }
  }
}
