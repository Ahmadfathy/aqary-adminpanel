import { Menu, Search, Bell, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSidebar } from '../../hooks/useSidebar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export function TopBar() {
  const { t } = useTranslation('common')
  const { toggle, toggleMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            onClick={toggleMobile}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            onClick={toggle}
          >
            <span className="sr-only">Toggle sidebar</span>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center lg:justify-start">
          <div className="w-full max-w-md relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder={t('search')}
              className="w-full rounded-full bg-zinc-100 dark:bg-zinc-900 border-none ps-10 pe-4 focus-visible:ring-1 focus-visible:ring-brand focus-visible:bg-white dark:focus-visible:bg-zinc-950 transition-colors shadow-none h-10"
            />
            <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-500 dark:text-zinc-400 h-5">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-2 sm:gap-x-4">
          <LanguageSwitcher />
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 h-9 w-9 rounded-full">
            <span className="sr-only">{t('notifications')}</span>
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 rounded-full bg-brand ring-2 ring-white dark:ring-zinc-950" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                  <AvatarImage src="https://i.pravatar.cc/150?img=11" alt="Avatar" />
                  <AvatarFallback className="bg-brand/10 text-brand font-medium">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400">
                    admin@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="me-2 h-4 w-4" />
                <span>{t('profile.settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <span>{t('profile.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
