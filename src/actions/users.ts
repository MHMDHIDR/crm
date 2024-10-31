'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { database } from '@/db'
import { users } from '@/db/schema'
import { hashedString } from '@/lib/crypt'
import { userSchema } from '@/validators/user'
import type { UserSchemaType } from '@/validators/user'

type CreateUserResult = {
  success: boolean
  message: string
}
//mr.hamood.277@gmail.com
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
        hashedPassword,
        emailVerified: new Date() // this is just a placeholder, you should send a verification email
      })
      .returning()

    if (!newUser) {
      return {
        success: false,
        message: 'Failed to create user'
      }
    }

    return {
      success: true,
      message: `${newUser.name} has been created successfully`
    }
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('. ')
      return {
        success: false,
        message: errorMessage
      }
    }

    // Handle other errors
    console.error('User creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create user. Please try again.'
    }
  }
}
