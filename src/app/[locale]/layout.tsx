import { Analytics } from '@vercel/analytics/react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Providers } from '@/providers'
import type { Locale } from '@/i18n/request'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const locale = (await params).locale

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale ?? 'en'} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <Analytics />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
