import { Analytics } from '@vercel/analytics/react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { getUserLanguage } from '@/actions/users/user-language'
import { Providers } from '@/providers'
import { LocaleProvider } from '@/providers/locale-provider'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getUserLanguage()) ?? (await getLocale())
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} dir={locale === 'en' ? 'ltr' : 'rtl'} suppressHydrationWarning>
      <head>
        <meta content='width=device-width, initial-scale=1 maximum-scale=1' name='viewport' />
        <link href='/images/logo.svg' rel='icon' type='image/svg+xml' />
      </head>
      <body className='min-h-screen bg-background' suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider initialLocale={locale}>
            <Providers>
              {children}
              <Analytics />
            </Providers>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
