import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import UsersClientPage from './users.client'

export default async function UsersPage() {
  const session = await auth()

  return !session || !session.user || session.user.role !== 'Admin' ? (
    notFound()
  ) : (
    <UsersClientPage />
  )
}
