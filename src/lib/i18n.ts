import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '../locales/en/common.json'
import enMenu from '../locales/en/menu.json'

import arCommon from '../locales/ar/common.json'
import arMenu from '../locales/ar/menu.json'

import kuCommon from '../locales/ku/common.json'
import kuMenu from '../locales/ku/menu.json'

const resources = {
  en: {
    common: enCommon,
    menu: enMenu,
  },
  ar: {
    common: arCommon,
    menu: arMenu,
  },
  ku: {
    common: kuCommon,
    menu: kuMenu,
  },
}

// Retrieve initial language from localStorage if available, otherwise 'ar'
const storedLang = localStorage.getItem('lang')
let initialLang = 'ar'
if (storedLang) {
  try {
    const parsed = JSON.parse(storedLang)
    if (parsed && parsed.state && parsed.state.language) {
      initialLang = parsed.state.language
    }
  } catch (e) {
    // Ignore error
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'ar',
    ns: ['common', 'menu'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  })

export default i18n
