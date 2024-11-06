import { notFound } from 'next/navigation'
import { getUserById } from '@/actions/users/get-users'
import EditUserPageClient from './edit-user.client'
import type { User } from '@/db/schema'

export default async function EditUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const userId = (await params).userId

  const { error, data: user }: { data?: User; error?: string } = await getUserById(userId)

  return !userId || !user || error ? notFound() : <EditUserPageClient user={user} />
}
