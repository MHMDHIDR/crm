'use client'

import { Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { updateUserLanguage } from '@/actions/users/user-language'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { UserPreferences } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'
import { Locale } from '@/i18n/routing'
import { getCookie } from '@/lib/get-cookies'
import { useLocale } from '@/providers/locale-provider'

export default function LanguageSelector() {
  const { setLocale, locale } = useLocale()
  const languageSelectTranslations = useTranslations('dashboard.languageSelect')
  const toast = useToast()

  const [currentLanguage, setCurrentLanguage] = useState<UserPreferences['language']>(locale)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch user's language preference on component mount
  useEffect(() => {
    async function fetchLanguage() {
      // const cookieStore = await cookies()
      // const language = cookieStore.get('NEXT_LOCALE')?.value as Locale
      // Get the current user's language preference from Client Cookies
      const language = getCookie('NEXT_LOCALE') as Locale

      setCurrentLanguage(language)
    }
    fetchLanguage()
  }, [])

  const handleLanguageChange = async (language: UserPreferences['language']) => {
    setIsUpdating(true)
    const { message, success } = await updateUserLanguage(language)

    if (success) {
      setCurrentLanguage(language)
      toast.success(message)

      setLocale(language || 'en')
    } else {
      console.error(message)
      toast.error(message)
    }
    setIsUpdating(false)
  }

  return (
    <div>
      <h2 className='mb-4 text-lg font-bold'>{languageSelectTranslations('title')}</h2>
      <div className='flex items-center gap-x-2'>
        <Languages className='w-4 h-4' />
        <Label>{languageSelectTranslations('title')}</Label>
        <Select value={currentLanguage} onValueChange={handleLanguageChange} disabled={isUpdating}>
          <SelectTrigger className='w-32 rtl:rtl'>
            <SelectValue placeholder={languageSelectTranslations('title')} />
          </SelectTrigger>
          <SelectContent className='rtl:rtl'>
            <SelectItem value='en'>{languageSelectTranslations('english')}</SelectItem>
            <SelectItem value='ar'>{languageSelectTranslations('arabic')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
