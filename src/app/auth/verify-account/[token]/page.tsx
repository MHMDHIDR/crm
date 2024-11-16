'use client'

import { useLocale } from 'next-intl'
import { redirect } from 'next/navigation'
import { use, useEffect } from 'react'
import { newVerification } from '@/actions/auth/new-verification'
import { useToast } from '@/hooks/use-toast'

// Define the response type
type VerificationResponse = { success: string; status?: number } | { error: string; status: number }

export default function NewVerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const toast = useToast()

  useEffect(() => {
    const verifyNewAccount = async () => {
      if (!token) {
        toast.error('Token is required, it is missing!')
        return
      }

      const verifyNewAccountResponse = (await newVerification(token)) as VerificationResponse

      if ('error' in verifyNewAccountResponse) {
        toast.error(verifyNewAccountResponse.error || 'Sorry the verification failed!')

        if (verifyNewAccountResponse.status === 404) {
          setTimeout(() => redirect('/lost-in-void'), 2000)
        }
        return
      }

      // Now TypeScript knows this is the success case
      toast.success(verifyNewAccountResponse.success)
      redirect('/auth/signin')
    }

    verifyNewAccount()
  }, [token, toast])

  return null
}
