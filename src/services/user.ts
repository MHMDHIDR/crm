import { eq } from 'drizzle-orm'
import { database } from '@/db/index'
import { users } from '@/db/schema'

export const getUserByEmail = async (email: string) => {
  try {
    const user = await database.query.users.findFirst({ where: eq(users.email, email) })

    return user
  } catch {
    return null
  }
}

export const getUserById = async (id: string) => {
  try {
    const user = await database.query.users.findFirst({ where: eq(users.id, id) })

    return user
  } catch {
    return null
  }
}
