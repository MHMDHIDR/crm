'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { database } from '@/db'
import { userPreferences } from '@/db/schema'
import type { UserPreferences, UserSession } from '@/db/schema'

/**
 * Get user theme preference
 * @param userId  ID of the user to get theme preference for
 * @returns {Promise<UserPreferences['theme']>} A promise that contains an array of user preferences 'light' | 'dark'
 */
export async function getUserTheme(): Promise<UserPreferences['theme']> {
  try {
    const session = await auth()
    const user = session?.user as UserSession

    if (!user?.id) {
      return 'light'
    }

    const preferences = (await database.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id)
    })) as UserPreferences

    return preferences?.theme || 'light'
  } catch (error) {
    console.error('Error getting user theme:', error)
    return 'light'
  }
}

/**
 * Update user theme preference
 * @param theme   Theme to update to  (light | dark)
 * @returns      Promise<{ success: boolean, message: string }>
 */
export async function updateUserTheme(
  theme: UserPreferences['theme']
): Promise<{ success: boolean; message: string }> {
  const actionsTranslations = await getTranslations('actions')

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: actionsTranslations('unauthorized') }
    }

    // First try to update existing preferences
    const [updatedPreferences] = await database
      .update(userPreferences)
      .set({ theme })
      .where(eq(userPreferences.userId, session.user.id))
      .returning()

    // If no preferences were updated, insert new preferences
    if (!updatedPreferences) {
      await database.insert(userPreferences).values({ userId: session.user.id, theme })
    }

    revalidatePath('/')
    return { success: true, message: actionsTranslations('themeChanged') }
  } catch (error) {
    console.error('Error updating theme:', error)
    return { success: false, message: actionsTranslations('failedUpdate') }
  }
}
