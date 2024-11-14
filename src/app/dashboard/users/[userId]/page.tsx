import { notFound } from 'next/navigation'
import { getUserById } from '@/actions/users/get-users'
import { env } from '@/env'
import EditUserPageClient from './edit-user.client'
import type { User } from '@/db/schema'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ userId: User['id'] }>
}): Promise<Metadata> {
  const { userId } = await params
  const { data: user }: { data?: User } = await getUserById(userId)

  return {
    title: `${user?.name} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default async function EditUserPage({
  params
}: {
  params: Promise<{ userId: User['id'] }>
}) {
  const userId = (await params).userId

  const { error, data: user }: { data?: User; error?: string } = await getUserById(userId)

  return !userId || !user || error ? notFound() : <EditUserPageClient user={user} />
}
