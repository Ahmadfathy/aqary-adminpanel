import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminLocationsAPI } from '@/lib/api-client'
import { cleanParams, entityName, errorMessages, isActive, unwrapList } from '@/lib/admin-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, Edit, Loader2, Map, MoreVertical, Plus, Search, Trash2, XCircle } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

const allValue = 'all'
const emptyForm = { name_ar: '', name_en: '', city_id: '', status: '1' }

export function NeighborhoodsPage() {
  const { t: tc } = useTranslation('common')
  const [areas, setAreas] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [governorates, setGovernorates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', governorate_id: allValue, city_id: allValue, status: allValue })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [toDelete, setToDelete] = useState<any>(null)

  const fetchLookups = async () => {
    try {
      const [govResponse, cityResponse] = await Promise.all([
        AdminLocationsAPI.getGovernorates({ country_id: 104 }),
        AdminLocationsAPI.getCities({ country_id: 104 }),
      ])
      setGovernorates(unwrapList(govResponse, ['governorates']))
      setCities(unwrapList(cityResponse, ['cities']))
    } catch {
      setGovernorates([])
      setCities([])
    }
  }

  const fetchAreas = async () => {
    setIsLoading(true)
    try {
      const response = await AdminLocationsAPI.getAreas(cleanParams({
        search: filters.search,
        governorate_id: filters.governorate_id === allValue ? '' : filters.governorate_id,
        city_id: filters.city_id === allValue ? '' : filters.city_id,
        status: filters.status === allValue ? '' : filters.status,
      }))
      setAreas(unwrapList(response, ['areas']))
    } catch {
      setAreas([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchLookups() }, [])
  useEffect(() => {
    const timeout = setTimeout(fetchAreas, 400)
    return () => clearTimeout(timeout)
  }, [filters])

  const filteredCities = useMemo(() => {
    if (filters.governorate_id === allValue) return cities
    return cities.filter(city => String(city.governorate_id || city.governorate?.id) === filters.governorate_id)
  }, [cities, filters.governorate_id])

  const formCities = useMemo(() => cities, [cities])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setErrors([])
    setSheetOpen(true)
  }

  const openEdit = (area: any) => {
    setEditing(area)
    setForm({
      name_ar: area.name_ar || area.name || '',
      name_en: area.name_en || '',
      city_id: String(area.city_id || area.city?.id || ''),
      status: isActive(area.status) ? '1' : '0',
    })
    setErrors([])
    setSheetOpen(true)
  }

  const handleSave = async () => {
    const nextErrors: string[] = []
    if (!form.name_ar.trim()) nextErrors.push(tc('settings.neighborhoods.nameArRequired'))
    if (!form.city_id) nextErrors.push(tc('settings.neighborhoods.cityRequired'))
    if (nextErrors.length) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    setErrors([])
    try {
      const payload = {
        name_ar: form.name_ar,
        name_en: form.name_en,
        city_id: Number(form.city_id),
        status: Number(form.status),
      }
      if (editing) await AdminLocationsAPI.updateArea(editing.id, payload)
      else await AdminLocationsAPI.createArea(payload)
      setSheetOpen(false)
      fetchAreas()
    } catch (err) {
      setErrors(errorMessages(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await AdminLocationsAPI.deleteArea(toDelete.id)
      setToDelete(null)
      fetchAreas()
    } catch {
      setToDelete(null)
    }
  }

  const toggleStatus = async (area: any) => {
    await AdminLocationsAPI.toggleAreaStatus(area.id)
    fetchAreas()
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name_ar',
      header: tc('settings.neighborhoods.col'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
            <Map className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-white">{entityName(row.original)}</p>
            {row.original.name_en && <p className="text-xs text-zinc-500">{row.original.name_en}</p>}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: tc('settings.neighborhoods.colCity'),
      cell: ({ row }) => {
        const city = row.original.city || cities.find(item => String(item.id) === String(row.original.city_id))
        return <span className="text-zinc-700 dark:text-zinc-300">{entityName(city)}</span>
      },
    },
    {
      accessorKey: 'governorate',
      header: tc('common.governorate'),
      cell: ({ row }) => {
        const city = row.original.city || cities.find(item => String(item.id) === String(row.original.city_id))
        const governorate = city?.governorate || governorates.find(item => String(item.id) === String(city?.governorate_id))
        return <span className="text-zinc-700 dark:text-zinc-300">{entityName(governorate)}</span>
      },
    },
    {
      accessorKey: 'status',
      header: tc('common.status'),
      cell: ({ row }) => {
        const active = isActive(row.original.status)
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
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 dark:bg-zinc-900 dark:border-zinc-800">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(row.original)}><Edit className="w-4 h-4" />{tc('btn.edit')}</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => toggleStatus(row.original)}>
              {isActive(row.original.status) ? <XCircle className="w-4 h-4 text-orange-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />} {tc('common.toggleStatus')}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10" onClick={() => setToDelete(row.original)}><Trash2 className="w-4 h-4" />{tc('btn.delete')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [cities, governorates, tc])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">{tc('settings.neighborhoods.title')}</h1>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={openAdd}><Plus className="w-4 h-4" />{tc('settings.neighborhoods.add')}</Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 grid gap-3 lg:grid-cols-[1fr_180px_180px_140px]">
          <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><Input placeholder={tc('settings.neighborhoods.search')} value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} className="pr-10 bg-white dark:bg-zinc-950" /></div>
          <Select value={filters.governorate_id} onValueChange={v => setFilters(p => ({ ...p, governorate_id: v, city_id: allValue }))} dir="rtl">
            <SelectTrigger><SelectValue placeholder={tc('common.governorate')} /></SelectTrigger>
            <SelectContent><SelectItem value={allValue}>{tc('common.allGovernorates')}</SelectItem>{governorates.map(item => <SelectItem key={item.id} value={String(item.id)}>{entityName(item)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.city_id} onValueChange={v => setFilters(p => ({ ...p, city_id: v }))} dir="rtl">
            <SelectTrigger><SelectValue placeholder={tc('common.city')} /></SelectTrigger>
            <SelectContent><SelectItem value={allValue}>{tc('common.allCities')}</SelectItem>{filteredCities.map(item => <SelectItem key={item.id} value={String(item.id)}>{entityName(item)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={v => setFilters(p => ({ ...p, status: v }))} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value={allValue}>{tc('status.allStatuses')}</SelectItem><SelectItem value="1">{tc('status.active')}</SelectItem><SelectItem value="0">{tc('status.inactive')}</SelectItem></SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={areas} isLoading={isLoading} emptyIcon={<Map className="h-5 w-5 text-zinc-400" />} emptyMessage={tc('settings.neighborhoods.noFound')} />
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md dark:bg-zinc-950 dark:border-zinc-800" dir="rtl">
          <SheetHeader className="mb-6"><SheetTitle>{editing ? tc('settings.neighborhoods.editTitle') : tc('settings.neighborhoods.addTitle')}</SheetTitle></SheetHeader>
          {errors.length > 0 && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{errors.map((e, i) => <p key={i}>{e}</p>)}</div>}
          <div className="space-y-4">
            <div className="space-y-2"><Label>{tc('common.nameAr')} <span className="text-red-500">*</span></Label><Input value={form.name_ar} onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))} placeholder={tc('settings.neighborhoods.nameArPlaceholder')} /></div>
            <div className="space-y-2"><Label>{tc('common.nameEn')}</Label><Input value={form.name_en} onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))} placeholder="e.g. Karrada" dir="ltr" /></div>
            <div className="space-y-2"><Label>{tc('settings.neighborhoods.colCity')} <span className="text-red-500">*</span></Label><Select value={form.city_id} onValueChange={v => setForm(p => ({ ...p, city_id: v }))} dir="rtl"><SelectTrigger><SelectValue placeholder={tc('settings.neighborhoods.selectCity')} /></SelectTrigger><SelectContent>{formCities.map(item => <SelectItem key={item.id} value={String(item.id)}>{entityName(item)}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{tc('common.status')}</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))} dir="rtl"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">{tc('status.active')}</SelectItem><SelectItem value="0">{tc('status.inactive')}</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex gap-3 mt-8">
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editing ? tc('btn.saveChanges') : tc('settings.neighborhoods.addBtn')}</Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>{tc('btn.cancel')}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={open => !open && setToDelete(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader><AlertDialogTitle className="text-right">{tc('common.deleteConfirmTitle')}</AlertDialogTitle><AlertDialogDescription className="text-right">{tc('settings.neighborhoods.deleteConfirm', { name: entityName(toDelete) })}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:flex-row-reverse sm:justify-start gap-2 mt-4"><AlertDialogCancel className="mt-0">{tc('btn.cancel')}</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>{tc('btn.deletePermanent')}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
