import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from '@/components/ui/sonner'
import AuthProvider from '@/providers/auth-provider'
import type { ThemeProviderProps } from 'next-themes/dist/types'

async function Providers({
  children,
  ...props
}: { children: React.ReactNode } & ThemeProviderProps) {
  return (
    <>
      <NextTopLoader color='#007AFF' showAtBottom={false} zIndex={1600} />
      <AuthProvider>
        <ThemeProvider attribute='class' {...props}>
          {children}
        </ThemeProvider>
      </AuthProvider>
      <Toaster />
    </>
  )
}

export { Providers }
