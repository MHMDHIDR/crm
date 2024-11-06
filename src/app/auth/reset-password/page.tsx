import { redirect } from 'next/navigation'
import ResetPasswordClientPage from '@/app/auth/reset-password/reset-password.client'
import { auth } from '@/auth'

export default async function ResetPasswordPage() {
  const session = await auth()

  return !session || !session.user ? <ResetPasswordClientPage /> : redirect('/dashboard')
}
