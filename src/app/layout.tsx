import { Analytics } from '@vercel/analytics/react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, setRequestLocale } from 'next-intl/server'
import { getUserLanguage } from '@/actions/users/user-language'
import { Providers } from '@/providers'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const language = await getUserLanguage()
  const locale = language ?? (await getLocale())
  setRequestLocale(locale)

  const messages = await getMessages({ locale })

  return (
    <html lang={locale} dir={locale === 'en' ? 'ltr' : 'rtl'} suppressHydrationWarning>
      <head>
        <meta content='width=device-width, initial-scale=1 maximum-scale=1' name='viewport' />
        <link href='/images/logo.svg' rel='icon' type='image/svg+xml' />
      </head>
      <body className='min-h-screen bg-background' suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Analytics />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
