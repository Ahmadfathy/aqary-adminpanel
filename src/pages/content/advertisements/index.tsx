import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminAdvertisementsAPI } from '@/lib/api-client'
import { cleanParams, errorMessages, isActive, unwrapItem, unwrapList } from '@/lib/admin-helpers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CalendarDays,
  CheckCircle2,
  Edit,
  Eye,
  Image,
  Loader2,
  Megaphone,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

type AdvertisementType = 'home_slider' | 'middle_home_banner' | 'bottom_cta_banner' | 'popup' | 'featured'
type TargetType = 'property' | 'external_url' | 'category' | 'none'

type Advertisement = {
  id: number | string
  title?: string
  title_ar?: string
  title_en?: string
  title_ku?: string
  subtitle?: string
  subtitle_ar?: string
  subtitle_en?: string
  subtitle_ku?: string
  image?: string
  image_url?: string
  type?: AdvertisementType | string
  target_type?: TargetType | string
  target_id?: number | string | null
  external_url?: string | null
  button_text?: string
  button_text_ar?: string
  button_text_en?: string
  button_text_ku?: string
  sort_order?: number | string | null
  starts_at?: string | null
  ends_at?: string | null
  is_active?: boolean | number | string
  status?: boolean | number | string
}

type AdvertisementForm = {
  title_ar: string
  title_en: string
  title_ku: string
  subtitle_ar: string
  subtitle_en: string
  subtitle_ku: string
  type: AdvertisementType
  target_type: TargetType
  target_id: string
  external_url: string
  button_text_ar: string
  button_text_en: string
  button_text_ku: string
  sort_order: string
  starts_at: string
  ends_at: string
  is_active: string
}

const allValue = 'all'

const emptyForm: AdvertisementForm = {
  title_ar: '',
  title_en: '',
  title_ku: '',
  subtitle_ar: '',
  subtitle_en: '',
  subtitle_ku: '',
  type: 'home_slider',
  target_type: 'none',
  target_id: '',
  external_url: '',
  button_text_ar: '',
  button_text_en: '',
  button_text_ku: '',
  sort_order: '',
  starts_at: '',
  ends_at: '',
  is_active: '1',
}

export function AdvertisementsPage() {
  const { t } = useTranslation('common')

  const advertisementTypes: { value: AdvertisementType; label: string }[] = [
    { value: 'home_slider', label: t('advertisements.types.home_slider') },
    { value: 'middle_home_banner', label: t('advertisements.types.middle_home_banner') },
    { value: 'bottom_cta_banner', label: t('advertisements.types.bottom_cta_banner') },
    { value: 'popup', label: t('advertisements.types.popup') },
    { value: 'featured', label: t('advertisements.types.featured') },
  ]

  const targetTypes: { value: TargetType; label: string }[] = [
    { value: 'property', label: t('advertisements.targets.property') },
    { value: 'external_url', label: t('advertisements.targets.external_url') },
    { value: 'category', label: t('advertisements.targets.category') },
    { value: 'none', label: t('advertisements.targets.none') },
  ]

  const [items, setItems] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', type: allValue, status: allValue })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [details, setDetails] = useState<Advertisement | null>(null)
  const [form, setForm] = useState<AdvertisementForm>({ ...emptyForm })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [toDelete, setToDelete] = useState<Advertisement | null>(null)

  const fetchAdvertisements = async () => {
    setIsLoading(true)
    try {
      const response = await AdminAdvertisementsAPI.getAdvertisements(cleanParams({
        search: filters.search,
        type: filters.type === allValue ? '' : filters.type,
        is_active: filters.status === allValue ? '' : filters.status,
      }))
      setItems(unwrapList(response, ['advertisements']))
    } catch {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(fetchAdvertisements, 350)
    return () => window.clearTimeout(timeout)
  }, [filters.search, filters.status, filters.type])

  useEffect(() => {
    if (!imageFile) return
    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setImageFile(null)
    setImagePreview('')
    setErrors([])
    setSheetOpen(true)
  }

  const openEdit = async (item: Advertisement) => {
    setErrors([])
    setEditing(item)
    applyAdvertisementToForm(item)
    setImageFile(null)
    setImagePreview(imageUrl(item))
    setSheetOpen(true)

    try {
      const response = await AdminAdvertisementsAPI.getAdvertisement(item.id)
      const advertisement = unwrapItem(response, ['advertisement']) as Advertisement
      setEditing(advertisement)
      applyAdvertisementToForm(advertisement)
      setImagePreview(imageUrl(advertisement))
    } catch {
      setErrors([t('advertisements.fetchError')])
    }
  }

  const openDetails = async (item: Advertisement) => {
    setDetails(item)
    setDetailsOpen(true)
    try {
      const response = await AdminAdvertisementsAPI.getAdvertisement(item.id)
      setDetails(unwrapItem(response, ['advertisement']) as Advertisement)
    } catch {
      setDetails(item)
    }
  }

  const applyAdvertisementToForm = (item: Advertisement) => {
    const targetType = isTargetType(item.target_type) ? item.target_type : 'none'
    setForm({
      title_ar: firstText(item.title_ar, item.title),
      title_en: cleanText(item.title_en),
      title_ku: cleanText(item.title_ku),
      subtitle_ar: firstText(item.subtitle_ar, item.subtitle),
      subtitle_en: cleanText(item.subtitle_en),
      subtitle_ku: cleanText(item.subtitle_ku),
      type: isAdvertisementType(item.type) ? item.type : 'home_slider',
      target_type: targetType,
      target_id: cleanText(item.target_id),
      external_url: cleanText(item.external_url),
      button_text_ar: firstText(item.button_text_ar, item.button_text),
      button_text_en: cleanText(item.button_text_en),
      button_text_ku: cleanText(item.button_text_ku),
      sort_order: cleanText(item.sort_order),
      starts_at: toDateTimeLocal(item.starts_at),
      ends_at: toDateTimeLocal(item.ends_at),
      is_active: isActive(item.is_active ?? item.status) ? '1' : '0',
    })
  }

  const setTargetType = (value: TargetType) => {
    setForm((previous) => ({
      ...previous,
      target_type: value,
      target_id: value === 'property' || value === 'category' ? previous.target_id : '',
      external_url: value === 'external_url' ? previous.external_url : '',
    }))
  }

  const buildFormData = () => {
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value)
    })
    if (imageFile) data.append('image', imageFile)
    return data
  }

  const validateForm = () => {
    const nextErrors: string[] = []
    if (!form.type) nextErrors.push(t('advertisements.typeRequired'))
    if (!form.starts_at) nextErrors.push(t('advertisements.startDateRequired'))
    if (!form.ends_at) nextErrors.push(t('advertisements.endDateRequired'))
    if (form.is_active === '') nextErrors.push(t('advertisements.statusRequired'))
    if (!imageFile && !imagePreview) nextErrors.push(t('advertisements.imageRequired'))
    return nextErrors
  }

  const handleSave = async () => {
    const nextErrors = validateForm()
    if (nextErrors.length) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    setErrors([])
    try {
      if (editing) await AdminAdvertisementsAPI.updateAdvertisement(editing.id, buildFormData())
      else await AdminAdvertisementsAPI.createAdvertisement(buildFormData())
      setSheetOpen(false)
      await fetchAdvertisements()
    } catch (err) {
      setErrors(errorMessages(err, t('advertisements.saveError')))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await AdminAdvertisementsAPI.deleteAdvertisement(toDelete.id)
      setToDelete(null)
      await fetchAdvertisements()
    } catch {
      setToDelete(null)
    }
  }

  const toggleStatus = async (item: Advertisement) => {
    await AdminAdvertisementsAPI.toggleStatus(item.id)
    await fetchAdvertisements()
  }

  const typeLabel = (value?: string) =>
    advertisementTypes.find((type) => type.value === value)?.label || cleanText(value) || '-'

  const targetLabel = (value?: string) =>
    targetTypes.find((type) => type.value === value)?.label || cleanText(value) || t('advertisements.noTarget')

  const columns = useMemo<ColumnDef<Advertisement>[]>(() => [
    {
      accessorKey: 'title',
      header: t('advertisements.col'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
            {imageUrl(row.original) ? (
              <img src={imageUrl(row.original)} alt={displayTitle(row.original)} className="h-full w-full object-cover" />
            ) : (
              <Image className="h-5 w-5 text-zinc-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900 dark:text-white">{displayTitle(row.original)}</p>
            <p className="line-clamp-1 text-xs text-zinc-500">{firstText(row.original.subtitle, row.original.subtitle_ar) || t('advertisements.noDesc')}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: t('advertisements.colType'),
      cell: ({ row }) => <Badge variant="outline">{typeLabel(row.original.type)}</Badge>,
    },
    {
      accessorKey: 'target_type',
      header: t('advertisements.colTarget'),
      cell: ({ row }) => (
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {targetLabel(row.original.target_type)}
          {cleanText(row.original.target_id) ? ` #${cleanText(row.original.target_id)}` : ''}
        </span>
      ),
    },
    {
      accessorKey: 'sort_order',
      header: t('advertisements.colOrder'),
      cell: ({ row }) => <span className="text-sm">{cleanText(row.original.sort_order) || '-'}</span>,
    },
    {
      accessorKey: 'is_active',
      header: t('advertisements.statusLabel'),
      cell: ({ row }) => <StatusBadge active={isActive(row.original.is_active ?? row.original.status)} activeLabel={t('advertisements.statusActive')} inactiveLabel={t('advertisements.statusInactive')} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 dark:border-zinc-800 dark:bg-zinc-900">
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openDetails(row.original)}>
              <Eye className="h-4 w-4" />
              {t('advertisements.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openEdit(row.original)}>
              <Edit className="h-4 w-4" />
              {t('btn.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => toggleStatus(row.original)}>
              <CheckCircle2 className="h-4 w-4 text-teal-500" />
              {t('advertisements.toggleStatus')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-500/10" onClick={() => setToDelete(row.original)}>
              <Trash2 className="h-4 w-4" />
              {t('btn.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [t])

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{t('advertisements.title')}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('advertisements.subtitle')}</p>
        </div>
        <Button className="gap-2 bg-teal-600 text-white hover:bg-teal-700" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          {t('advertisements.addNew')}
        </Button>
      </div>

      <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0f0f11]">
        <div className="grid gap-3 border-b border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder={t('advertisements.searchPlaceholder')}
              value={filters.search}
              onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value }))}
              className="bg-white ps-10 dark:bg-zinc-950"
            />
          </div>
          <Select value={filters.type} onValueChange={(value) => setFilters((previous) => ({ ...previous, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={t('advertisements.typeLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>{t('advertisements.allTypes')}</SelectItem>
              {advertisementTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value) => setFilters((previous) => ({ ...previous, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={t('advertisements.statusLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>{t('status.allStatuses')}</SelectItem>
              <SelectItem value="1">{t('advertisements.statusActive')}</SelectItem>
              <SelectItem value="0">{t('advertisements.statusInactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          emptyIcon={<Megaphone className="h-5 w-5 text-zinc-400" />}
          emptyMessage={t('advertisements.noFound')}
        />
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full overflow-y-auto dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-3xl">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? t('advertisements.editTitle') : t('advertisements.addTitle')}</SheetTitle>
          </SheetHeader>

          {errors.length > 0 && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {errors.map((error, index) => <p key={index}>{error}</p>)}
            </div>
          )}

          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectInput label={t('advertisements.typeLabel')} value={form.type} onChange={(value) => setForm((previous) => ({ ...previous, type: value as AdvertisementType }))} options={advertisementTypes} required />
              <SelectInput label={t('advertisements.targetTypeLabel')} value={form.target_type} onChange={(value) => setTargetType(value as TargetType)} options={targetTypes} />
            </div>

            {form.target_type === 'external_url' && (
              <TextInput label={t('advertisements.externalUrlLabel')} value={form.external_url} onChange={(value) => setForm((previous) => ({ ...previous, external_url: value }))} dir="ltr" />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <DateInput label={t('advertisements.startDateLabel')} value={form.starts_at} onChange={(value) => setForm((previous) => ({ ...previous, starts_at: value }))} required />
              <DateInput label={t('advertisements.endDateLabel')} value={form.ends_at} onChange={(value) => setForm((previous) => ({ ...previous, ends_at: value }))} required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SelectInput
                label={t('advertisements.statusLabel')}
                value={form.is_active}
                onChange={(value) => setForm((previous) => ({ ...previous, is_active: value }))}
                options={[
                  { value: '1', label: t('advertisements.statusActive') },
                  { value: '0', label: t('advertisements.statusInactive') },
                ]}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <Label>{t('advertisements.imageLabel')} <span className="text-red-500">*</span></Label>
                <Input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
                <p className="text-xs text-zinc-500">{t('advertisements.imageNote')}</p>
              </div>
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                {imagePreview ? (
                  <img src={imagePreview} alt={t('advertisements.imagePreview')} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-xs text-zinc-400">
                    <Image className="h-6 w-6" />
                    {t('advertisements.imagePreview')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button className="flex-1 gap-2 bg-teal-600 text-white hover:bg-teal-700" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? t('btn.saveChanges') : t('advertisements.saveNew')}
            </Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>{t('btn.cancel')}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="left" className="w-full overflow-y-auto dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-xl">
          <SheetHeader className="mb-6">
            <SheetTitle>{t('advertisements.detailTitle')}</SheetTitle>
          </SheetHeader>
          {details && (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                {imageUrl(details) ? (
                  <img src={imageUrl(details)} alt={displayTitle(details)} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="flex aspect-video items-center justify-center text-zinc-400"><Image className="h-8 w-8" /></div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{displayTitle(details)}</h2>
                <p className="mt-1 text-sm text-zinc-500">{firstText(details.subtitle, details.subtitle_ar) || t('advertisements.noDesc')}</p>
              </div>
              <div className="grid gap-3 text-sm">
                <DetailRow label={t('advertisements.colType')} value={typeLabel(details.type)} />
                <DetailRow label={t('advertisements.colTarget')} value={targetLabel(details.target_type)} />
                <DetailRow label={t('advertisements.detailTargetId')} value={cleanText(details.target_id) || '-'} />
                <DetailRow label={t('advertisements.detailExternalUrl')} value={cleanText(details.external_url) || '-'} ltr />
                <DetailRow label={t('advertisements.detailButtonText')} value={firstText(details.button_text, details.button_text_ar) || '-'} />
                <DetailRow label={t('advertisements.detailSortOrder')} value={cleanText(details.sort_order) || '-'} />
                <DetailRow label={t('advertisements.detailStartDate')} value={cleanText(details.starts_at) || '-'} ltr />
                <DetailRow label={t('advertisements.detailEndDate')} value={cleanText(details.ends_at) || '-'} ltr />
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                  <span className="text-zinc-500">{t('advertisements.statusLabel')}</span>
                  <StatusBadge active={isActive(details.is_active ?? details.status)} activeLabel={t('advertisements.statusActive')} inactiveLabel={t('advertisements.statusInactive')} />
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent className="dark:border-zinc-800 dark:bg-[#0f0f11]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('advertisements.deleteConfirm', { name: displayTitle(toDelete) })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <AlertDialogCancel className="mt-0">{t('btn.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>{t('btn.deletePermanent')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function TextInput({ label, value, onChange, required, dir, type = 'text', className = '' }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; dir?: 'rtl' | 'ltr'; type?: string; className?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} dir={dir} className={className} />
    </div>
  )
}

function DateInput({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    const input = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null
    if (input?.showPicker) input.showPicker()
    else input?.focus()
  }

  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          dir="ltr"
          className="text-left pe-11 [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute end-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-zinc-600 transition-colors hover:text-teal-600 dark:text-zinc-300 dark:hover:text-teal-400"
          aria-label={label}
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function SelectInput({ label, value, onChange, options, required }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function StatusBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
      {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

function DetailRow({ label, value, ltr }: { label: string; value: string | number; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3 dark:border-zinc-800">
      <span className="text-zinc-500">{label}</span>
      <span className="max-w-[70%] truncate font-medium text-zinc-900 dark:text-white" dir={ltr ? 'ltr' : 'rtl'}>{value}</span>
    </div>
  )
}

function displayTitle(item?: Advertisement | null) {
  return firstText(item?.title, item?.title_ar, item?.title_en, item?.title_ku) || '-'
}

function imageUrl(item?: Advertisement | null) {
  return firstText(item?.image_url, item?.image)
}

function isAdvertisementType(value: unknown): value is AdvertisementType {
  return ['home_slider', 'middle_home_banner', 'bottom_cta_banner', 'popup', 'featured'].includes(value as string)
}

function isTargetType(value: unknown): value is TargetType {
  return ['property', 'external_url', 'category', 'none'].includes(value as string)
}

function toDateTimeLocal(value?: string | null) {
  const cleanValue = cleanText(value)
  if (!cleanValue) return ''
  return cleanValue.slice(0, 10)
}

function cleanText(value: unknown) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return text.trim().toLowerCase() === 'null' ? '' : text
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = cleanText(value)
    if (text) return text
  }
  return ''
}
