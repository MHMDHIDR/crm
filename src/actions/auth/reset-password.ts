'use server'

import * as z from 'zod'
import { addEvent } from '@/actions/events/add-event'
import { getUserByEmail } from '@/actions/users/get-users'
import { sendPasswordResetEmail } from '@/lib/mail'
import { generatePasswordResetToken } from '@/lib/tokens'
import { userSchema } from '@/validators/user'

// Create reset password schema with optional 2FA code
const resetPasswordSchema = userSchema.pick({ email: true })

type resetPasswordResult = { success: boolean; message: string }

export async function resetPassword(
  values: z.infer<typeof resetPasswordSchema>
): Promise<resetPasswordResult> {
  const validatedFields = resetPasswordSchema.safeParse(values)

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid emaiL!' }
  }

  const { email } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    return { success: false, message: 'Email not found!' }
  }

  const passwordResetToken = await generatePasswordResetToken(email)
  const passwordResetTokenSentEmail = await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  )

  const addedEvent = await addEvent(`Password Reset Email Sent to ${email}`)

  if (passwordResetTokenSentEmail.error || !addedEvent.success) {
    return {
      success: false,
      message: `Failed to send reset email! ${passwordResetTokenSentEmail.error?.message}`
    }
  }

  return {
    success: true,
    message: `Reset Email sent! 🎉\n Please Check out Your Email for Further instructions.`
  }
}
