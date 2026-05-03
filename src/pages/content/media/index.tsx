import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function ContentMediaPage() {
  const { t } = useTranslation('menu')
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t('media')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export</Button>
          <Button>Create New</Button>
        </div>
      </div>
      
      {/* Placeholder content */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="h-8 w-16 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="min-h-[400px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          Main content area for Media Library
        </div>
      </div>
    </div>
  )
}
