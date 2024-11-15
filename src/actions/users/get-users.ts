'use server'

import { eq, or } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { database } from '@/db'
import { UserRole, users } from '@/db/schema'
import type { User } from '@/db/schema'

/**
 * Fetch all users from the database except the current authorized admin
 * @returns    Promise<{ success: boolean; data?: User[]; error?: string }>
 */
export async function getUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
  const actionsTranslations = await getTranslations('actions')

  const session = await auth()
  if (!session || !session.user || session.user.role !== 'Admin') {
    return { success: false, error: actionsTranslations('unauthorized') }
  }

  const authorizedAdmin = session.user

  try {
    const allUsers = await database.query.users.findMany({
      where: (users, { ne }) => ne(users.id, authorizedAdmin.id),
      orderBy: (users, { desc }) => [desc(users.emailVerified)],
      with: { supervisor: true }
    })

    return { success: true, data: allUsers }
  } catch (error) {
    return { success: false, error: actionsTranslations('failedFetch') }
  }
}

/**
 * Fetch a single user by email from the database
 * @param email   Email address of the user
 * @returns        Promise<User | null>
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await database.query.users.findFirst({ where: eq(users.email, email) })

    return user || null
  } catch {
    return null
  }
}

/**
 * Fetch a single user by ID from the database
 * @returns    Promise<{ success: boolean; data?: User[]; error?: string }>
 */
export async function getUserById(
  userId: User['id']
): Promise<{ success: boolean; data?: User; error?: string }> {
  const actionsTranslations = await getTranslations('actions')

  try {
    const user = await database.query.users.findFirst({
      where: eq(users.id, userId)
    })

    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: actionsTranslations('failedFetch') }
  }
}

export type SupervisorType = Pick<User, 'id' | 'name' | 'email'>

export async function fetchSupervisors(): Promise<SupervisorType[]> {
  return await database
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(or(eq(users.role, UserRole.SUPERVISOR), eq(users.role, UserRole.ADMIN)))
}
