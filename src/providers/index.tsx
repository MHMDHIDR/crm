import NextTopLoader from 'nextjs-toploader'
import { Toaster } from '@/components/ui/sonner'
import AuthProvider from '@/providers/auth-provider'
import { ThemeProvider } from '@/providers/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader color='#007AFF' showAtBottom={false} zIndex={1600} />
      <AuthProvider>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
      <Toaster />
    </>
  )
}
