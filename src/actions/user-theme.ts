'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { database } from '@/db'
import { userPreferences } from '@/db/schema'
import type { UserPreferences } from '@/db/schema'

/**
 * Get user theme preference
 * @returns {Promise<UserPreferences['theme']>} A promise that contains an array of user preferences 'light' | 'dark'
 */
export async function getUserTheme(): Promise<UserPreferences['theme']> {
  const preferences = await database.query.userPreferences.findFirst()
  return preferences?.theme || 'light'
}

/**
 * Update user theme preference
 * @param theme   Theme to update to  (light | dark)
 * @returns      Promise<{ success: boolean, message: string }>
 */
export async function updateUserTheme(
  theme: 'light' | 'dark'
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return { success: false, message: 'User not authenticated' }
    }

    // First try to update existing preferences
    const updatedPreferences = await database
      .update(userPreferences)
      .set({ theme })
      .where(eq(userPreferences.userId, session.user.id))

    // If no preferences were updated, insert new preferences
    if (updatedPreferences.count === 0) {
      await database
        .insert(userPreferences)
        .values({ userId: session.user.id, theme, language: 'en' })
    }

    revalidatePath('/dashboard/preferences')
    return { success: true, message: 'Theme updated successfully 🎉' }
  } catch (error) {
    console.error('Error updating theme:', error)
    return { success: false, message: 'Error updating theme!' }
  }
}
