import { getLocale } from 'next-intl/server'
import ResetPasswordClientPage from '@/app/auth/reset-password/reset-password.client'
import { auth } from '@/auth'
import { redirect } from '@/i18n/routing'

export default async function ResetPasswordPage() {
  const locale = await getLocale()
  const session = await auth()

  return !session || !session.user ? (
    <ResetPasswordClientPage />
  ) : (
    redirect({ href: '/dashboard', locale })
  )
}
