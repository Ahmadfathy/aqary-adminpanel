import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { menu, type MenuItem } from '../../lib/menu'
import { useDirection } from '../../hooks/useDirection'

function findBreadcrumbs(
  items: MenuItem[],
  pathname: string,
  currentPath: MenuItem[] = []
): MenuItem[] | null {
  for (const item of items) {
    const newPath = [...currentPath, item]
    if (item.path && pathname.startsWith(item.path)) {
      // If we match exactly or are a sub-route (for dynamic routes if any)
      if (pathname === item.path) {
        return newPath
      }
    }
    if (item.children) {
      const found = findBreadcrumbs(item.children, pathname, newPath)
      if (found) return found
    }
  }
  return null
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const { t } = useTranslation('menu')
  const { isRTL } = useDirection()

  const breadcrumbs = findBreadcrumbs(menu, pathname)

  if (!breadcrumbs || breadcrumbs.length === 0) return null

  const Chevron = isRTL ? ChevronLeft : ChevronRight

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center space-x-1 space-x-reverse text-sm text-zinc-500 rtl:space-x-reverse">
      <Link
        to="/"
        className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        {t('common:home', 'Home')}
      </Link>
      {breadcrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <Chevron className="h-4 w-4 mx-1 opacity-50" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {t(item.labelKey.replace('menu:', ''))}
            </span>
          ) : (
            <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              {t(item.labelKey.replace('menu:', ''))}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
