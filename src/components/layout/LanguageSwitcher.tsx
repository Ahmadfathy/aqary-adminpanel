import { useLanguageStore, type Language } from '../../store/language.store'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ku', name: 'کوردی', flag: '🇹🇯' }, // Using Tajikistan flag as placeholder or simple Globe.
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore()

  const currentLang = languages.find((l) => l.code === language) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2 text-zinc-600 dark:text-zinc-300">
          <span className="text-base leading-none">{currentLang.flag}</span>
          <span className="text-sm font-medium hidden sm:inline-block">
            {currentLang.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`gap-3 cursor-pointer ${
              language === lang.code ? 'bg-zinc-100 dark:bg-zinc-800' : ''
            }`}
          >
            <span className="text-base leading-none">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
