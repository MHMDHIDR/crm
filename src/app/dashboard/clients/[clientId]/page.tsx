import { notFound } from 'next/navigation'
import { getClientById } from '@/actions/clients/get-clients'
import { env } from '@/env'
import EditClientPageClient from './edit-client.client'
import type { Client } from '@/db/schema'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ clientId: Client['id'] }>
}): Promise<Metadata> {
  const { clientId } = await params
  const { data: client }: { data?: Client } = await getClientById(clientId)

  return {
    title: `${client?.name} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default async function EditClientPage({
  params
}: {
  params: Promise<{ clientId: string }>
}) {
  const clientId = (await params).clientId

  const { error, data: client }: { data?: Client; error?: string } = await getClientById(clientId)

  return !clientId || !client || error ? notFound() : <EditClientPageClient client={client} />
}
