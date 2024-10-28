'use server'

import { z } from 'zod'
import { signIn } from '@/auth'

const signInSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
})

export async function authenticate(formData: FormData) {
  const validatedFields = signInSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password')
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid credentials'
    }
  }

  try {
    await signIn('credentials', {
      username: validatedFields.data.username,
      password: validatedFields.data.password,
      redirect: false
    })

    return { success: true }
  } catch (error) {
    return {
      error: 'Authentication failed'
    }
  }
}
