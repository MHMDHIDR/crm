import { Resend } from 'resend'
import { env } from '@/env'

const resend = new Resend(env.RESEND_API_KEY)

const domain = env.NEXT_PUBLIC_APP_URL

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`

  await resend.emails.send({
    from: env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: email,
    subject: 'Confirm your email',
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
  })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`

  await resend.emails.send({
    from: env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
  })
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: email,
    subject: '2FA Code',
    html: `<p>Your 2FA code: ${token}</p>`
  })
}
