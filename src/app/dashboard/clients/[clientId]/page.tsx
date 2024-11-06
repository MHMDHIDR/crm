import { notFound } from 'next/navigation'
import { getClientById } from '@/actions/clients/get-clients'
import EditClientPageClient from './edit-client.client'
import type { Client } from '@/db/schema'

export default async function EditClientPage({
  params
}: {
  params: Promise<{ clientId: string }>
}) {
  const clientId = (await params).clientId

  const { error, data: client }: { data?: Client; error?: string } = await getClientById(clientId)

  return !clientId || !client || error ? notFound() : <EditClientPageClient client={client} />
}
