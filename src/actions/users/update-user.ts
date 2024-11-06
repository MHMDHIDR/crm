'use server'

import { eq } from 'drizzle-orm'
import { getUserById } from '@/actions/users/get-users'
import { auth, update } from '@/auth'
import { database } from '@/db'
import { users } from '@/db/schema'
import { compareHashedStrings, hashedString } from '@/lib/crypt'

const allowedRoles = ['Admin', 'Supervisor', 'Employee'] as const
type UserRole = (typeof allowedRoles)[number]

interface ExtendedSettingsInput {
  id?: string | null
  name?: string | null
  email?: string | null
  password?: string | null
  role?: string | null
  isTwoFactorEnabled?: boolean | null
}

export const updateUser = async (values: ExtendedSettingsInput) => {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { data: dbUser } = await getUserById(values.id ?? session.user.id)

  if (!dbUser) {
    return { error: 'Unauthorized' }
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
      : undefined)
  }

  // Filter out null or undefined values
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== null && value !== undefined)
  )

  if (Object.keys(filteredUpdates).length === 0) {
    return { error: 'No changes detected' }
  }

  const [updatedUser] = await database
    .update(users)
    .set(filteredUpdates)
    .where(eq(users.id, dbUser.id))
    .returning()

  if (!updatedUser) {
    return { error: 'Failed to update settings' }
  }

  update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      role: updatedUser.role ?? undefined
    }
  })

  return { success: 'Settings Updated!' }
}
