import { useEffect } from 'react'
import { useLanguageStore } from '../store/language.store'
import { useTranslation } from 'react-i18next'

export function useDirection() {
  const { language } = useLanguageStore()
  const { i18n } = useTranslation()

  useEffect(() => {
    const dir = language === 'ar' || language === 'ku' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = language
    i18n.changeLanguage(language)
  }, [language, i18n])

  return {
    language,
    isRTL: language === 'ar' || language === 'ku',
    dir: (language === 'ar' || language === 'ku' ? 'rtl' : 'ltr') as 'rtl' | 'ltr'
  }
}
