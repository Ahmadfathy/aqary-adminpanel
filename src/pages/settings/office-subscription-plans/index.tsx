import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminOfficeSubscriptionPlansAPI, AdminSettingsAPI } from '@/lib/api-client'
import { entityName, errorMessages, isActive, unwrapItem, unwrapList } from '@/lib/admin-helpers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CheckCircle2, CreditCard, Edit, Loader2, Power, XCircle } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

const emptyForm = {
  price: '',
  currency: 'IQD',
  is_active: '1',
  sort_order: '0',
  description_ar: '',
  description_en: '',
  description_ku: '',
}

const planOrder = ['normal', 'plus', 'vip']

const planCode = (plan: any) => String(plan?.code || plan?.slug || plan?.type || '').toLowerCase()

const planName = (plan: any) => {
  const name = entityName(plan)
  const code = planCode(plan)
  return name !== 'â€"' && name !== '—' ? name : code ? code.toUpperCase() : '—'
}

export function OfficeSubscriptionPlansPage() {
  const { t: tc } = useTranslation('common')
  const [plans, setPlans] = useState<any[]>([])
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [savingPlanId, setSavingPlanId] = useState<string | number | null>(null)
  const [enablingSubscriptions, setEnablingSubscriptions] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [plansResponse, settingsResponse] = await Promise.all([
        AdminOfficeSubscriptionPlansAPI.getPlans(),
        AdminSettingsAPI.getSettings(),
      ])
      const list = unwrapList(plansResponse, ['plans', 'office_subscription_plans'])
      setPlans([...list].sort((a, b) => {
        const aIndex = planOrder.indexOf(planCode(a))
        const bIndex = planOrder.indexOf(planCode(b))
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
      }))
      const nextSettings = unwrapItem(settingsResponse, ['settings'])
      setSettings(nextSettings)
      setSubscriptionsEnabled(Boolean(nextSettings.office_subscriptions_enabled))
    } catch {
      setPlans([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openEdit = (plan: any) => {
    setEditing(plan)
    setForm({
      price: String(plan.price ?? ''),
      currency: plan.currency || 'IQD',
      is_active: isActive(plan.is_active ?? plan.status) ? '1' : '0',
      sort_order: String(plan.sort_order ?? 0),
      description_ar: plan.description_ar || '',
      description_en: plan.description_en || '',
      description_ku: plan.description_ku || '',
    })
    setErrors([])
    setSheetOpen(true)
  }

  const planPayload = (plan: any, overrides: Record<string, any> = {}) => ({
    code: plan.code || plan.slug || plan.id,
    name_ar: plan.name_ar || plan.name || plan.title_ar || '',
    name_en: plan.name_en || plan.title_en || '',
    name_ku: plan.name_ku || plan.title_ku || '',
    description_ar: plan.description_ar || '',
    description_en: plan.description_en || '',
    description_ku: plan.description_ku || '',
    price: Number(plan.price || 0),
    currency: plan.currency || 'IQD',
    is_active: isActive(plan.is_active ?? plan.status),
    sort_order: Number(plan.sort_order || 0),
    ...overrides,
  })

  const handleSave = async () => {
    if (!editing) return
    if (!form.price) {
      setErrors([tc('settings.plans.priceRequired')])
      return
    }

    setSaving(true)
    setErrors([])
    try {
      await AdminOfficeSubscriptionPlansAPI.updatePlan(editing.id, planPayload(editing, {
        price: Number(form.price),
        currency: form.currency,
        is_active: form.is_active === '1',
        sort_order: Number(form.sort_order || 0),
        description_ar: form.description_ar,
        description_en: form.description_en,
        description_ku: form.description_ku,
      }))
      setSheetOpen(false)
      fetchData()
    } catch (err) {
      setErrors(errorMessages(err, tc('settings.plans.errorUpdate')))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (plan: any) => {
    setSavingPlanId(plan.id)
    setErrors([])
    try {
      await AdminOfficeSubscriptionPlansAPI.updatePlan(plan.id, planPayload(plan, {
        is_active: !isActive(plan.is_active ?? plan.status),
      }))
      fetchData()
    } catch (err) {
      setErrors(errorMessages(err, tc('settings.plans.errorToggle')))
    } finally {
      setSavingPlanId(null)
    }
  }

  const handleEnableSubscriptions = async () => {
    setEnablingSubscriptions(true)
    setErrors([])
    try {
      await AdminSettingsAPI.updateSettings({ ...settings, office_subscriptions_enabled: true })
      setSubscriptionsEnabled(true)
      setSettings((current: any) => ({ ...current, office_subscriptions_enabled: true }))
    } catch (err) {
      setErrors(errorMessages(err, tc('settings.plans.errorEnable')))
    } finally {
      setEnablingSubscriptions(false)
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: tc('settings.plans.col'),
      cell: ({ row }) => {
        const description = row.original.description || row.original.description_ar || row.original.description_en || row.original.description_ku
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-zinc-900 dark:text-white">{planName(row.original)}</p>
              <p className="text-xs text-zinc-500" dir="ltr">{row.original.code || row.original.slug || row.original.type || '-'}</p>
              {description && <p className="text-xs text-zinc-500 mt-1 max-w-xl whitespace-pre-line line-clamp-2">{description}</p>}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      header: tc('settings.plans.price'),
      cell: ({ row }) => <span className="font-mono text-sm">{Number(row.original.price || 0).toLocaleString('en-US')} {row.original.currency || 'IQD'}</span>,
    },
    {
      accessorKey: 'sort_order',
      header: tc('settings.plans.sortOrder'),
      cell: ({ row }) => <span className="text-sm">{row.original.sort_order ?? '-'}</span>,
    },
    {
      accessorKey: 'is_active',
      header: tc('common.status'),
      cell: ({ row }) => {
        const active = isActive(row.original.is_active ?? row.original.status)
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'}`}>
            {active ? <><CheckCircle2 className="w-3.5 h-3.5" />{tc('status.active')}</> : <><XCircle className="w-3.5 h-3.5" />{tc('status.inactive')}</>}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const plan = row.original
        const active = isActive(plan.is_active ?? plan.status)
        const isSavingRow = savingPlanId === plan.id
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => openEdit(plan)}>
              <Edit className="w-4 h-4" />{tc('settings.plans.editPrice')}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleToggle(plan)} disabled={isSavingRow}>
              {isSavingRow ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
              {active ? tc('settings.plans.disable') : tc('settings.plans.enable')}
            </Button>
          </div>
        )
      },
    },
  ], [savingPlanId, tc])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">{tc('settings.plans.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1">{tc('settings.plans.subtitle')}</p>
      </div>

      {!subscriptionsEnabled && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>{tc('settings.plans.subscriptionsDisabled')}</span>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-2" onClick={handleEnableSubscriptions} disabled={enablingSubscriptions}>
            {enablingSubscriptions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
            {tc('settings.plans.enableSubscriptions')}
          </Button>
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {errors.map((error, idx) => <p key={idx}>{error}</p>)}
        </div>
      )}

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <DataTable columns={columns} data={plans} isLoading={isLoading} emptyIcon={<CreditCard className="h-5 w-5 text-zinc-400" />} emptyMessage={tc('settings.plans.noFound')} />
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800" dir="rtl">
          <SheetHeader className="mb-6"><SheetTitle>{tc('settings.plans.editTitle')} {planName(editing)}</SheetTitle></SheetHeader>
          {errors.length > 0 && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{errors.map((e, i) => <p key={i}>{e}</p>)}</div>}
          <div className="space-y-4">
            <div className="space-y-2"><Label>{tc('settings.plans.price')}</Label><Input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} dir="ltr" type="number" /></div>
            <div className="space-y-2"><Label>{tc('settings.plans.currency')}</Label><Input value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} dir="ltr" /></div>
            <div className="space-y-2"><Label>{tc('settings.plans.sortOrder')}</Label><Input value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} dir="ltr" type="number" /></div>
            <div className="space-y-2"><Label>{tc('settings.plans.descAr')}</Label><textarea value={form.description_ar} onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))} maxLength={1500} className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" /></div>
            <div className="space-y-2"><Label>{tc('settings.plans.descEn')}</Label><textarea value={form.description_en} onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))} maxLength={1500} dir="ltr" className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" /></div>
            <div className="space-y-2"><Label>{tc('settings.plans.descKu')}</Label><textarea value={form.description_ku} onChange={e => setForm(p => ({ ...p, description_ku: e.target.value }))} maxLength={1500} className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" /></div>
            <div className="space-y-2"><Label>{tc('common.status')}</Label><Select value={form.is_active} onValueChange={v => setForm(p => ({ ...p, is_active: v }))} dir="rtl"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">{tc('status.active')}</SelectItem><SelectItem value="0">{tc('status.inactive')}</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex gap-3 mt-8">
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}{tc('btn.saveChanges')}</Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>{tc('btn.cancel')}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
