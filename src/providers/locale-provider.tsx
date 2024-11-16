'use client'

import { createContext, useContext, useState } from 'react'
import { defaultLocale, locales, usePathname, useRouter } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({
  children,
  initialLocale = defaultLocale
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale)
  const router = useRouter()
  const pathname = usePathname()

  const setLocale = (newLocale: Locale) => {
    if (!locales.includes(newLocale)) return
    setLocaleState(newLocale)

    // Force a hard navigation to update the locale
    const currentPath = pathname || '/'
    router.refresh()
    router.push(currentPath)
  }

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
