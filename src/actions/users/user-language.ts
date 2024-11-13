'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { database } from '@/db'
import { userPreferences } from '@/db/schema'
import type { UserPreferences, UserSession } from '@/db/schema'

/**
 * Get user language preference
 * @param userId  ID of the user to get language preference for
 * @returns {Promise<UserPreferences['language']>} A promise that contains an array of user preferences 'light' | 'dark'
 */
export async function getUserLanguage(): Promise<UserPreferences['language']> {
  try {
    const session = await auth()
    const user = session?.user as UserSession

    if (!user?.id) {
      return 'en'
    }

    const preferences = (await database.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id)
    })) as UserPreferences

    return preferences?.language || 'en'
  } catch (error) {
    console.error('Error getting user language:', error)
    return 'en'
  }
}

/**
 * Update user language preference
 * @param language   Language to update to  (en | ar)
 * @returns      Promise<{ success: boolean, message: string }>
 */
export async function updateUserLanguage(
  language: UserPreferences['language']
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'User not authenticated' }
    }

    // First try to update existing preferences
    const [updatedPreferences] = await database
      .update(userPreferences)
      .set({ language })
      .where(eq(userPreferences.userId, session.user.id))
      .returning()

    // If no preferences were updated, insert new preferences
    if (!updatedPreferences) {
      await database.insert(userPreferences).values({ userId: session.user.id, language })
    }

    revalidatePath('/')
    return { success: true, message: 'Language updated successfully 🎉' }
  } catch (error) {
    console.error('Error updating language:', error)
    return { success: false, message: 'Error updating language!' }
  }
}
