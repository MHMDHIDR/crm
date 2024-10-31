import { Resend } from 'resend'
import { env } from '@/env'

const RESEND = new Resend(env.RESEND_API_KEY)
const DOMAIN = env.NEXT_PUBLIC_APP_URL

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${DOMAIN}/auth/verify-account/${token}`

  await RESEND.emails.send({
    from: env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: email,
    subject: 'Confirm your email',
    html: `<p>Click <a href="${confirmLink}">here</a> to Confirm Email, and Verify your account.</p>`
  })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${DOMAIN}/auth/new-password/${token}`

  await RESEND.emails.send({
    from: env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to Reset Your Password.</p>`
  })
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await RESEND.emails.send({
    from: env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: email,
    subject: '2FA Code',
    html: `<p>Your 2FA code: ${token}</p>`
  })
}
