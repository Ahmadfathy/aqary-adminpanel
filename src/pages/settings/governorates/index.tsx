import { useEffect, useMemo, useState } from 'react'
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
import { CheckCircle2, Edit, Loader2, MapPin, MoreVertical, Plus, Search, Trash2, XCircle } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

const defaultCountryId = '104'
const emptyForm = { name_ar: '', name_en: '', country_id: defaultCountryId, status: '1' }

export function GovernoratesPage() {
  const [governorates, setGovernorates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', country_id: defaultCountryId, status: 'all' })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [toDelete, setToDelete] = useState<any>(null)

  const fetchGovernorates = async () => {
    setIsLoading(true)
    try {
      const response = await AdminLocationsAPI.getGovernorates(cleanParams({
        ...filters,
        status: filters.status === 'all' ? '' : filters.status,
      }))
      setGovernorates(unwrapList(response, ['governorates']))
    } catch {
      setGovernorates([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchGovernorates, 400)
    return () => clearTimeout(timeout)
  }, [filters])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setErrors([])
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      name_ar: item.name_ar || item.name || '',
      name_en: item.name_en || '',
      country_id: String(item.country_id || item.country?.id || defaultCountryId),
      status: isActive(item.status) ? '1' : '0',
    })
    setErrors([])
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.name_ar.trim()) {
      setErrors(['الاسم بالعربي مطلوب'])
      return
    }
    setSaving(true)
    setErrors([])
    try {
      const payload = cleanParams({
        name_ar: form.name_ar,
        name_en: form.name_en,
        country_id: form.country_id ? Number(form.country_id) : undefined,
        status: Number(form.status),
      })
      if (editing) await AdminLocationsAPI.updateGovernorate(editing.id, payload)
      else await AdminLocationsAPI.createGovernorate(payload)
      setSheetOpen(false)
      fetchGovernorates()
    } catch (err) {
      setErrors(errorMessages(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await AdminLocationsAPI.deleteGovernorate(toDelete.id)
      setToDelete(null)
      fetchGovernorates()
    } catch {
      setToDelete(null)
    }
  }

  const toggleStatus = async (item: any) => {
    await AdminLocationsAPI.toggleGovernorateStatus(item.id)
    fetchGovernorates()
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name_ar',
      header: 'المحافظة',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-white">{entityName(row.original)}</p>
            {row.original.name_en && <p className="text-xs text-zinc-500">{row.original.name_en}</p>}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'country_id',
      header: 'الدولة',
      cell: ({ row }) => <span className="text-sm text-zinc-600 dark:text-zinc-300">{row.original.country?.name_ar || row.original.country_id || defaultCountryId}</span>,
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const active = isActive(row.original.status)
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'}`}>
            {active ? <><CheckCircle2 className="w-3.5 h-3.5" />نشط</> : <><XCircle className="w-3.5 h-3.5" />غير نشط</>}
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
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(row.original)}><Edit className="w-4 h-4" />تعديل</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => toggleStatus(row.original)}>
              {isActive(row.original.status) ? <XCircle className="w-4 h-4 text-orange-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              تغيير الحالة
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10" onClick={() => setToDelete(row.original)}>
              <Trash2 className="w-4 h-4" />حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">المحافظات</h1>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={openAdd}><Plus className="w-4 h-4" />إضافة محافظة</Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input placeholder="البحث في المحافظات..." value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} className="pr-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" />
          </div>
          <Input value={filters.country_id} onChange={e => setFilters(p => ({ ...p, country_id: e.target.value }))} placeholder="country_id" dir="ltr" />
          <Select value={filters.status} onValueChange={v => setFilters(p => ({ ...p, status: v }))} dir="rtl">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">كل الحالات</SelectItem><SelectItem value="1">نشط</SelectItem><SelectItem value="0">غير نشط</SelectItem></SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={governorates} isLoading={isLoading} emptyIcon={<MapPin className="h-5 w-5 text-zinc-400" />} emptyMessage="لا توجد محافظات مضافة حتى الآن." />
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md dark:bg-zinc-950 dark:border-zinc-800" dir="rtl">
          <SheetHeader className="mb-6"><SheetTitle>{editing ? 'تعديل المحافظة' : 'إضافة محافظة جديدة'}</SheetTitle></SheetHeader>
          {errors.length > 0 && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{errors.map((e, i) => <p key={i}>{e}</p>)}</div>}
          <div className="space-y-4">
            <div className="space-y-2"><Label>الاسم بالعربي <span className="text-red-500">*</span></Label><Input value={form.name_ar} onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))} placeholder="مثال: بغداد" /></div>
            <div className="space-y-2"><Label>الاسم بالإنجليزي</Label><Input value={form.name_en} onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))} placeholder="e.g. Baghdad" dir="ltr" /></div>
            <div className="space-y-2"><Label>country_id اختياري</Label><Input value={form.country_id} onChange={e => setForm(p => ({ ...p, country_id: e.target.value }))} placeholder="104" dir="ltr" /></div>
            <div className="space-y-2"><Label>الحالة</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))} dir="rtl"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">نشط</SelectItem><SelectItem value="0">غير نشط</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex gap-3 mt-8">
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editing ? 'حفظ التعديلات' : 'إضافة المحافظة'}</Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>إلغاء</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={open => !open && setToDelete(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">هل تريد حذف "{entityName(toDelete)}"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:flex-row-reverse sm:justify-start gap-2 mt-4">
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>حذف نهائي</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
