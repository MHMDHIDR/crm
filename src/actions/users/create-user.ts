'use server'

import { eq } from 'drizzle-orm'
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
      return { success: false, message: 'Email is already in use, please use a different email' }
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
        hashedPassword
      })
      .returning()
    const addedEvent = await addEvent(`User ${newUser.name} created`)

    if (!newUser || !addedEvent.success) {
      return { success: false, message: 'Failed to create user' }
    }

    const verificationToken = await generateVerificationToken(newUser.email)
    await sendVerificationEmail(verificationToken.email, verificationToken.token)

    return {
      success: true,
      message: `${newUser.name} has been Created Successfully 🎉.\nEmail has been sent to ${newUser.email} for verification.`
    }
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('. ')
      return { success: false, message: errorMessage }
    }

    // Handle other errors
    console.error('User creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create user. Please try again.'
    }
  }
}
