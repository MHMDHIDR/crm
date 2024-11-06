import { redirect } from 'next/navigation'
import SignInClientPage from '@/app/[locale]/auth/signin/signin.client'
import { auth } from '@/auth'

export default async function SignInPage() {
  const session = await auth()

  return !session || !session.user ? <SignInClientPage /> : redirect('/dashboard')
}
