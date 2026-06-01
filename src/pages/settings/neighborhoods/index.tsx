import { useEffect, useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminLocationsAPI } from '@/lib/api-client'
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
import { Search, Plus, MoreVertical, Edit, Trash2, CheckCircle2, XCircle, Map, Loader2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

const empty = { name_ar: '', name_en: '', city_id: '', status: '1' }

export function NeighborhoodsPage() {
  const [areas, setAreas] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ ...empty })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [areaToDelete, setAreaToDelete] = useState<any>(null)

  const fetchAreas = async () => {
    setIsLoading(true)
    try {
      const response = await AdminLocationsAPI.getAreas({ search })
      let data = response?.data?.data?.data || response?.data?.data || response?.data || []
      if (!Array.isArray(data)) data = data?.items || data?.areas || data?.data || []
      setAreas(Array.isArray(data) ? data : [])
    } catch {
      setAreas([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCities = async () => {
    try {
      const response = await AdminLocationsAPI.getCities({})
      let data = response?.data?.data?.data || response?.data?.data || response?.data || []
      if (!Array.isArray(data)) data = data?.items || data?.cities || data?.data || []
      setCities(Array.isArray(data) ? data : [])
    } catch {
      setCities([])
    }
  }

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchAreas, 500)
    return () => clearTimeout(t)
  }, [search])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...empty })
    setErrors([])
    setSheetOpen(true)
  }

  const openEdit = (area: any) => {
    setEditing(area)
    setForm({
      name_ar: area.name_ar || area.name || '',
      name_en: area.name_en || '',
      city_id: area.city_id ? String(area.city_id) : (area.city?.id ? String(area.city.id) : ''),
      status: area.status === 1 || area.status === true || area.status === 'active' ? '1' : '0',
    })
    setErrors([])
    setSheetOpen(true)
  }

  const handleSave = async () => {
    const errs: string[] = []
    if (!form.name_ar.trim()) errs.push('الاسم بالعربي مطلوب')
    if (!form.city_id) errs.push('يجب اختيار المدينة')
    if (errs.length) { setErrors(errs); return }

    setSaving(true)
    setErrors([])
    try {
      const payload = {
        name_ar: form.name_ar,
        name_en: form.name_en,
        city_id: Number(form.city_id),
        status: Number(form.status),
      }
      if (editing) {
        await AdminLocationsAPI.updateArea(editing.id, payload)
      } else {
        await AdminLocationsAPI.createArea(payload)
      }
      setSheetOpen(false)
      fetchAreas()
    } catch (err: any) {
      const data = err.response?.data
      if (data?.errors) {
        setErrors(Object.values(data.errors).flat() as string[])
      } else {
        setErrors([data?.message || 'حدث خطأ، يرجى المحاولة مرة أخرى'])
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!areaToDelete) return
    try {
      await AdminLocationsAPI.deleteArea(areaToDelete.id)
      setAreaToDelete(null)
      fetchAreas()
    } catch {
      setAreaToDelete(null)
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name_ar',
      header: 'المنطقة',
      cell: ({ row }) => {
        const area = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
              <Map className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">{area.name_ar || area.name || '—'}</p>
              {area.name_en && <p className="text-xs text-zinc-500">{area.name_en}</p>}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'city',
      header: 'المدينة',
      cell: ({ row }) => {
        const area = row.original
        const fromObject = typeof area.city === 'object' ? (area.city?.name_ar || area.city?.name) : null
        const fromLookup = area.city_id ? cities.find((c: any) => c.id === area.city_id || c.id === Number(area.city_id)) : null
        const cityName = fromObject || area.city_name || area.city_name_ar || (fromLookup ? (fromLookup.name_ar || fromLookup.name) : null)
        return <span className="text-zinc-700 dark:text-zinc-300">{cityName || '—'}</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const active = row.original.status === 1 || row.original.status === true || row.original.status === 'active'
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
          <DropdownMenuContent align="end" className="w-40 dark:bg-zinc-900 dark:border-zinc-800">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(row.original)}>
              <Edit className="w-4 h-4" />تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
              onClick={() => setAreaToDelete(row.original)}
            >
              <Trash2 className="w-4 h-4" />حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [cities])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          المناطق
        </h1>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />إضافة منطقة
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="البحث في المناطق..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={areas}
          isLoading={isLoading}
          emptyIcon={<Map className="h-5 w-5 text-zinc-400" />}
          emptyMessage="لا توجد مناطق مضافة حتى الآن."
        />
      </Card>

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md dark:bg-zinc-950 dark:border-zinc-800" dir="rtl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-zinc-900 dark:text-white">{editing ? 'تعديل المنطقة' : 'إضافة منطقة جديدة'}</SheetTitle>
          </SheetHeader>

          {errors.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم بالعربي <span className="text-red-500">*</span></Label>
              <Input
                value={form.name_ar}
                onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                placeholder="مثال: الكرادة"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={form.name_en}
                onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                placeholder="e.g. Karrada"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>المدينة <span className="text-red-500">*</span></Label>
              <Select value={form.city_id} onValueChange={v => setForm(p => ({ ...p, city_id: v }))} dir="rtl">
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name_ar || city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))} dir="rtl">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">نشط</SelectItem>
                  <SelectItem value="0">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing ? 'حفظ التعديلات' : 'إضافة المنطقة'}
            </Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>إلغاء</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!areaToDelete} onOpenChange={open => !open && setAreaToDelete(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-zinc-900 dark:text-zinc-100">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-zinc-500 dark:text-zinc-400">
              هل أنت متأكد من حذف منطقة "{areaToDelete?.name_ar || areaToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:flex-row-reverse sm:justify-start gap-2 mt-4">
            <AlertDialogCancel className="mt-0 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>حذف نهائي</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
