import NextTopLoader from 'nextjs-toploader'
import { Toaster } from '@/components/ui/sonner'
import AuthProvider from './auth-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader color='#007AFF' showAtBottom={false} zIndex={1600} />
      <AuthProvider>{children}</AuthProvider>
      <Toaster />
    </>
  )
}
