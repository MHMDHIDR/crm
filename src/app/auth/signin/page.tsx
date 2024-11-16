import { getLocale } from 'next-intl/server'
import SignInClientPage from '@/app/auth/signin/signin.client'
import { auth } from '@/auth'
import { redirect } from '@/i18n/routing'

export default async function SignInPage() {
  const locale = await getLocale()
  const session = await auth()

  return !session || !session.user ? <SignInClientPage /> : redirect({ href: '/dashboard', locale })
}
