'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { users } from '@/db/schema'
import { hashedString } from '@/lib/crypt'
import { sendVerificationEmail } from '@/lib/mail'
import { generateVerificationToken } from '@/lib/tokens'
import { userSchema } from '@/validators/user'
import type { UserSchemaType } from '@/validators/user'

type CreateUserResult = { success: boolean; message: string }

export async function createUser(data: UserSchemaType): Promise<CreateUserResult> {
  const actionsTranslations = await getTranslations('actions')

  try {
    // Validate the input data
    const validatedData = userSchema.parse(data)

    // Check if email already exists
    const existingUser = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1)

    if (existingUser.length > 0) {
      return {
        success: false,
        message: actionsTranslations('usedEmail')
      }
    }

    const hashedPassword = hashedString(validatedData.password)

    // Create the user record
    const [newUser] = await database
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        image: validatedData.image,
        hashedPassword,
        supervisorId: validatedData.supervisorId
      })
      .returning()

    const addedEvent = await addEvent(
      actionsTranslations('userCreated', {
        userName: newUser.name
      })
    )

    if (!newUser || !addedEvent.success) {
      return {
        success: false,
        message: actionsTranslations('failedCreateUser')
      }
    }

    const verificationToken = await generateVerificationToken(newUser.email)
    await sendVerificationEmail(verificationToken.email, verificationToken.token)

    return {
      success: true,
      message: actionsTranslations('userCreatedWithVerification', {
        userName: newUser.name,
        userEmail: newUser.email
      })
    }
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('. ')
      return {
        success: false,
        message: actionsTranslations('validationError', {
          errorMessage
        })
      }
    }

    // Handle other errors
    console.error('User creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : actionsTranslations('failedCreateUser')
    }
  }
}
