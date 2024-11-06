'use client'

import { Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { getUserLanguage, updateUserLanguage } from '@/actions/users/user-language'
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

export default function LanguageSelector() {
  const storedLanguage = localStorage.getItem('language') as UserPreferences['language']

  const [currentLanguage, setCurrentLanguage] =
    useState<UserPreferences['language']>(storedLanguage)
  const [isUpdating, setIsUpdating] = useState(false)
  const toast = useToast()
  const navTranslations = useTranslations('Nav.LanguageSwitcher')

  // Fetch user's language preference on component mount
  useEffect(() => {
    async function fetchLanguage() {
      const language = await getUserLanguage()
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
      // Update local storage
      localStorage.setItem('language', language)
    } else {
      console.error(message)
      toast.error(message)
    }
    setIsUpdating(false)
  }

  return (
    <div>
      <h2 className='text-lg font-bold mb-4'>Language</h2>
      <div className='flex items-center gap-x-2'>
        <Languages className='h-4 w-4' />
        <Label>{navTranslations('ariaLabel')}</Label>
        <Select value={currentLanguage} onValueChange={handleLanguageChange} disabled={isUpdating}>
          <SelectTrigger className='w-32'>
            <SelectValue placeholder='Select language' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='en'>🇬🇧 English</SelectItem>
            <SelectItem value='ar'>🇸🇦 العربية</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
