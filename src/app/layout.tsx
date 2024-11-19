import { SpeedInsights } from '@vercel/speed-insights/next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { getUserLanguage } from '@/actions/users/user-language'
import { env } from '@/env'
import { Providers } from '@/providers'
import { LocaleProvider } from '@/providers/locale-provider'
import type { Metadata } from 'next'
import './globals.css'
import { cookies } from 'next/headers'
import { defaultLocale, Locale } from '@/i18n/routing'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: env.NEXT_PUBLIC_APP_NAME,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // const locale = (await getUserLanguage()) ?? (await getLocale())
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale
  const locale = cookieLocale ?? defaultLocale
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
            <SpeedInsights />
            <Providers>{children}</Providers>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
