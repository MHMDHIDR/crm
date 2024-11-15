'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { addEvent } from '@/actions/events/add-event'
import { auth } from '@/auth'
import { database } from '@/db'
import { Client, clients } from '@/db/schema'
import type { ClientSchemaType } from '@/validators/client'

type CreateClientResult = { success: boolean; message: string }

export async function createClient(data: ClientSchemaType): Promise<CreateClientResult> {
  const actionsTranslations = await getTranslations('actions')

  // Get the current assigned employee ID
  const session = await auth()
  if (!session?.user) {
    return { success: false, message: actionsTranslations('unauthorized') }
  }

  try {
    // Check if email of the client is already in use
    const existingClient = await database
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.email, data.email))
      .limit(1)

    if (existingClient.length > 0) {
      return { success: false, message: actionsTranslations('usedEmail') }
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
    const addedEvent = await addEvent(
      actionsTranslations('eventClientCreated', { clientName: newClient.name })
    )

    if (!newClient || !addedEvent.success) {
      return { success: false, message: actionsTranslations('failedAction') }
    }

    return {
      success: true,
      message: actionsTranslations('eventClientCreated', { clientName: newClient.name })
    }
  } catch (error) {
    console.error('Client creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : actionsTranslations('failedAction')
    }
  }
}
