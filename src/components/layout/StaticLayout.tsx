import { Outlet, Link } from 'react-router-dom'
import { useDirection } from '../../hooks/useDirection'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import logo from '../../assets/logo.png'

export function StaticLayout() {
  const { dir } = useDirection()
  const { t } = useTranslation('common')

  return (
    <div
      className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50"
      dir={dir}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow duration-300 p-1.5">
              <img src={logo} alt="Aqary" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Aqary
            </span>
          </Link>
          <div className="flex items-center gap-x-2 sm:gap-x-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center p-1">
                <img src={logo} alt="Aqary" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                © {new Date().getFullYear()} Aqary. {t('static.allRightsReserved')}
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                to="/terms"
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {t('static.termsOfService')}
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {t('static.privacyPolicy')}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
