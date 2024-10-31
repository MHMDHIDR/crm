import NextTopLoader from 'nextjs-toploader'
import { getUserTheme } from '@/actions/user-theme'
import { Toaster } from '@/components/ui/sonner'
import AuthProvider from '@/providers/auth-provider'
import { ThemeProvider } from '@/providers/theme-provider'

async function Providers({ children }: { children: React.ReactNode }) {
  const userTheme = await getUserTheme()
  const theme = userTheme === 'light' || userTheme === 'dark' ? userTheme : 'system'

  return (
    <>
      <NextTopLoader color='#007AFF' showAtBottom={false} zIndex={1600} />
      <AuthProvider>
        <ThemeProvider
          attribute='class'
          defaultTheme={theme}
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

export { Providers }
