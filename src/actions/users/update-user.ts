'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { addEvent } from '@/actions/events/add-event'
import { getUserById } from '@/actions/users/get-users'
import { auth, update } from '@/auth'
import { database } from '@/db'
import { users } from '@/db/schema'
import { compareHashedStrings, hashedString } from '@/lib/crypt'

const allowedRoles = ['Admin', 'Supervisor', 'Employee'] as const

type UserRole = (typeof allowedRoles)[number]
type ExtendedSettingsInput = {
  id?: string | null
  name?: string | null
  email?: string | null
  password?: string | null
  role?: string | null
  supervisorId?: string | null
  isTwoFactorEnabled?: boolean | null
}

/**
 * Update a Single User settings in the database
 * @param values <ExtendedSettingsInput> - User settings to update
 * @returns Promise<{ success: string } | { error: string }> with success message or error
 */
export const updateUser = async (values: ExtendedSettingsInput) => {
  const actionsTranslations = await getTranslations('actions')

  const session = await auth()
  if (!session?.user) {
    return { error: actionsTranslations('unauthorized') }
  }

  const { data: dbUser } = await getUserById(values.id ?? session.user.id)
  if (!dbUser) {
    return { error: actionsTranslations('unauthorized') }
  }

  // Prepare fields to update only if they've changed or have a value
  const updates: Partial<ExtendedSettingsInput> = {
    ...(typeof values.name === 'string' && values.name !== dbUser.name
      ? { name: values.name }
      : undefined),
    ...(typeof values.email === 'string' && values.email !== dbUser.email
      ? { email: values.email }
      : undefined),
    ...(values.password && !compareHashedStrings(values.password, dbUser.hashedPassword as string)
      ? { hashedPassword: hashedString(values.password) }
      : undefined),
    ...(typeof values.isTwoFactorEnabled === 'boolean' &&
    values.isTwoFactorEnabled !== dbUser.isTwoFactorEnabled
      ? { isTwoFactorEnabled: values.isTwoFactorEnabled }
      : undefined),
    ...(allowedRoles.includes(values.role as UserRole)
      ? { role: values.role as UserRole }
      : undefined),
    ...(values.supervisorId !== dbUser.supervisorId
      ? { supervisorId: values.supervisorId }
      : undefined)
  }

  // Filter out null or undefined values
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== null && value !== undefined)
  )

  if (Object.keys(filteredUpdates).length === 0) {
    return { error: actionsTranslations('noChanges') }
  }

  const [updatedUser] = await database
    .update(users)
    .set(filteredUpdates)
    .where(eq(users.id, dbUser.id))
    .returning()
  const addedEvent = await addEvent(`Updated user ${updatedUser.name}.`)

  if (!updatedUser || !addedEvent.success) {
    return { error: actionsTranslations('failedUpdate') }
  }

  update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      role: updatedUser.role ?? undefined,
      supervisorId: updatedUser.supervisorId
    }
  })

  return { success: actionsTranslations('updatedSettings') }
}
