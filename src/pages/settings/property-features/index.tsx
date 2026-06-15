import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminPropertyFeaturesAPI } from '@/lib/api-client'
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
import { Search, Plus, MoreVertical, Edit, Trash2, CheckCircle2, XCircle, Star, Loader2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

const empty = { name_ar: '', name_en: '', code: '', status: '1' }

export function PropertyFeaturesPage() {
  const { t: tc } = useTranslation('common')
  const [features, setFeatures] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ ...empty })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  const fetchFeatures = async () => {
    setIsLoading(true)
    try {
      const response = await AdminPropertyFeaturesAPI.getFeatures()
      const data = response?.data?.data?.property_features || response?.data?.property_features || []
      setFeatures(Array.isArray(data) ? data : [])
    } catch {
      setFeatures([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchFeatures() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? features.filter(f =>
      (f.name_ar || '').toLowerCase().includes(q) ||
      (f.name_en || '').toLowerCase().includes(q) ||
      (f.code || '').toLowerCase().includes(q)
    ) : features)
  }, [search, features])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...empty })
    setErrors([])
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      name_ar: item.name_ar || item.name || '',
      name_en: item.name_en || '',
      code: item.code || '',
      status: item.status === 1 || item.status === true || item.status === 'active' ? '1' : '0',
    })
    setErrors([])
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.name_ar.trim()) { setErrors([tc('settings.propertyFeatures.nameArRequired')]); return }
    setSaving(true)
    setErrors([])
    try {
      const payload = { name_ar: form.name_ar, name_en: form.name_en, code: form.code, status: Number(form.status) }
      if (editing) {
        await AdminPropertyFeaturesAPI.updateFeature(editing.id, payload)
      } else {
        await AdminPropertyFeaturesAPI.createFeature(payload)
      }
      setSheetOpen(false)
      fetchFeatures()
    } catch (err: any) {
      const data = err.response?.data
      if (data?.errors) setErrors(Object.values(data.errors).flat() as string[])
      else setErrors([data?.message || tc('common.errorGeneric')])
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await AdminPropertyFeaturesAPI.deleteFeature(itemToDelete.id)
      setItemToDelete(null)
      fetchFeatures()
    } catch { setItemToDelete(null) }
  }

  const handleToggle = async (item: any) => {
    try {
      await AdminPropertyFeaturesAPI.toggleStatus(item.id)
      fetchFeatures()
    } catch { /* ignore */ }
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name_ar',
      header: tc('settings.propertyFeatures.col'),
      cell: ({ row }) => {
        const f = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">{f.name_ar || f.name || '—'}</p>
              {f.name_en && <p className="text-xs text-zinc-500">{f.name_en}</p>}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'code',
      header: tc('settings.propertyFeatures.code'),
      cell: ({ row }) => (
        <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
          {row.original.code || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: tc('common.status'),
      cell: ({ row }) => {
        const active = row.original.status === 1 || row.original.status === true || row.original.status === 'active'
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
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 dark:bg-zinc-900 dark:border-zinc-800">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(row.original)}>
              <Edit className="w-4 h-4" />{tc('btn.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleToggle(row.original)}>
              {row.original.status === 1 || row.original.status === true || row.original.status === 'active'
                ? <><XCircle className="w-4 h-4 text-orange-500" /><span className="text-orange-500">{tc('btn.disable')}</span></>
                : <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-emerald-500">{tc('btn.activate')}</span></>}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
              onClick={() => setItemToDelete(row.original)}
            >
              <Trash2 className="w-4 h-4" />{tc('btn.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [tc])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          {tc('settings.propertyFeatures.title')}
        </h1>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />{tc('settings.propertyFeatures.add')}
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder={tc('settings.propertyFeatures.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyIcon={<Star className="h-5 w-5 text-zinc-400" />}
          emptyMessage={tc('settings.propertyFeatures.noFound')}
        />
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md dark:bg-zinc-950 dark:border-zinc-800" dir="rtl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-zinc-900 dark:text-white">{editing ? tc('settings.propertyFeatures.editTitle') : tc('settings.propertyFeatures.addTitle')}</SheetTitle>
          </SheetHeader>

          {errors.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{tc('common.nameAr')} <span className="text-red-500">*</span></Label>
              <Input value={form.name_ar} onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))} placeholder={tc('settings.propertyFeatures.nameArPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label>{tc('common.nameEn')}</Label>
              <Input value={form.name_en} onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))} placeholder="e.g. Swimming Pool" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{tc('settings.propertyFeatures.code')}</Label>
              <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. pool" dir="ltr" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>{tc('common.status')}</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))} dir="rtl">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{tc('status.active')}</SelectItem>
                  <SelectItem value="0">{tc('status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? tc('btn.saveChanges') : tc('settings.propertyFeatures.addBtn')}
            </Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>{tc('btn.cancel')}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!itemToDelete} onOpenChange={open => !open && setItemToDelete(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-zinc-900 dark:text-zinc-100">{tc('common.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-zinc-500 dark:text-zinc-400">
              {tc('settings.propertyFeatures.deleteConfirm', { name: itemToDelete?.name_ar || itemToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:flex-row-reverse sm:justify-start gap-2 mt-4">
            <AlertDialogCancel className="mt-0 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">{tc('btn.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>{tc('btn.deletePermanent')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
