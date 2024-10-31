'use server'

import { signIn } from '@/auth'
import { userSchema } from '@/validators/user'

type SignInResult = {
  success: boolean
  message: string
}

export async function authenticate(formData: FormData): Promise<SignInResult> {
  // Create a subset of userSchema for sign-in validation
  const signInSchema = userSchema.pick({ email: true, password: true })

  const validatedFields = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid email or password' }
  }

  try {
    await signIn('credentials', {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false
    })

    return { success: true, message: 'Successfully signed in' }
  } catch (error) {
    console.error('Sign-in error:', error)

    return { success: false, message: 'Invalid email or password' }
  }
}
