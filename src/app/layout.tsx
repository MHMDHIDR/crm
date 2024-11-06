import { Analytics } from '@vercel/analytics/react'
import { Providers } from '@/providers'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // const language = await getUserLanguage()
  // const locale = language ?? (await params).locale
  // if (!routing.locales.includes(locale as Locale)) { notFound() }
  // setRequestLocale(locale)
  // const messages = await getMessages()

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta content='width=device-width, initial-scale=1 maximum-scale=1' name='viewport' />
        <link href='/images/logo.svg' rel='icon' type='image/svg+xml' />
      </head>
      <body className='min-h-screen bg-background' suppressHydrationWarning>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
