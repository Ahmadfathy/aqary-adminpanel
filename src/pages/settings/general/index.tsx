import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminSettingsAPI } from '@/lib/api-client'
import { errorMessages, unwrapItem } from '@/lib/admin-helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Settings } from 'lucide-react'

export function SettingsGeneralPage() {
  const { t: tc } = useTranslation('common')
  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    app_advertisements_enabled: true,
    office_subscriptions_enabled: false,
    app_version: '',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await AdminSettingsAPI.getSettings()
        const settings = unwrapItem(response, ['settings'])
        setForm({
          app_advertisements_enabled: Boolean(settings.app_advertisements_enabled),
          office_subscriptions_enabled: Boolean(settings.office_subscriptions_enabled),
          app_version: settings.app_version || '',
        })
      } catch (err) {
        setErrors(errorMessages(err, tc('settings.general.fetchError')))
      } finally {
        setIsFetching(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    setErrors([])
    try {
      await AdminSettingsAPI.updateSettings(form)
      setSaved(true)
    } catch (err) {
      setErrors(errorMessages(err, tc('settings.general.saveError')))
    } finally {
      setIsSaving(false)
    }
  }

  if (isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">{tc('settings.general.title')}</h1>
          <p className="text-sm text-zinc-500 mt-1">{tc('settings.general.subtitle')}</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {tc('btn.save')}
        </Button>
      </div>

      {errors.length > 0 && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{errors.map((error, idx) => <p key={idx}>{error}</p>)}</div>}
      {saved && <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm">{tc('settings.general.savedSuccess')}</div>}

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="h-10 w-10 rounded bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center"><Settings className="w-5 h-5 text-teal-600 dark:text-teal-400" /></div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white">{tc('settings.general.sectionTitle')}</h2>
              <p className="text-sm text-zinc-500">{tc('settings.general.sectionDesc')}</p>
            </div>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">{tc('settings.general.enableAds')}</p>
              <p className="text-sm text-zinc-500">{tc('settings.general.enableAdsDesc')}</p>
            </div>
            <input type="checkbox" className="h-5 w-5 accent-teal-600" checked={form.app_advertisements_enabled} onChange={e => setForm(p => ({ ...p, app_advertisements_enabled: e.target.checked }))} />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">{tc('settings.general.enableSubscriptions')}</p>
              <p className="text-sm text-zinc-500">{tc('settings.general.enableSubscriptionsDesc')}</p>
            </div>
            <input type="checkbox" className="h-5 w-5 accent-teal-600" checked={form.office_subscriptions_enabled} onChange={e => setForm(p => ({ ...p, office_subscriptions_enabled: e.target.checked }))} />
          </label>

          <div className="space-y-2">
            <Label>{tc('settings.general.appVersion')}</Label>
            <Input value={form.app_version} onChange={e => setForm(p => ({ ...p, app_version: e.target.value }))} placeholder="1.0.3" dir="ltr" className="max-w-xs text-right" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
