import { useEffect, useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminPropertyCategoriesAPI, AdminPropertyTypesAPI } from '@/lib/api-client'
import { entityName, unwrapList } from '@/lib/admin-helpers'
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
import { Search, Plus, MoreVertical, Edit, Trash2, CheckCircle2, XCircle, Home, Loader2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

const empty = { name_ar: '', name_en: '', status: '1', property_category_ids: [] as string[] }

export function PropertyTypesPage() {
  const [types, setTypes] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ ...empty })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  const fetchTypes = async () => {
    setIsLoading(true)
    try {
      const response = await AdminPropertyTypesAPI.getTypes()
      const data = response?.data?.data?.property_types || response?.data?.property_types || []
      setTypes(Array.isArray(data) ? data : [])
    } catch {
      setTypes([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await AdminPropertyCategoriesAPI.getCategories()
      setCategories(unwrapList(response, ['property_categories', 'categories']))
    } catch {
      setCategories([])
    }
  }

  useEffect(() => {
    fetchTypes()
    fetchCategories()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? types.filter(t =>
      (t.name_ar || '').toLowerCase().includes(q) ||
      (t.name_en || '').toLowerCase().includes(q)
    ) : types)
  }, [search, types])

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
      property_category_ids: (item.property_category_ids || item.property_categories?.map((category: any) => category.id) || []).map(String),
      status: item.status === 1 || item.status === true || item.status === 'active' ? '1' : '0',
    })
    setErrors([])
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.name_ar.trim()) { setErrors(['الاسم بالعربي مطلوب']); return }
    setSaving(true)
    setErrors([])
    try {
      const payload = {
        name_ar: form.name_ar,
        name_en: form.name_en,
        property_category_ids: form.property_category_ids.map(Number),
        status: Number(form.status),
      }
      if (editing) {
        await AdminPropertyTypesAPI.updateType(editing.id, payload)
      } else {
        await AdminPropertyTypesAPI.createType(payload)
      }
      setSheetOpen(false)
      fetchTypes()
    } catch (err: any) {
      const data = err.response?.data
      if (data?.errors) setErrors(Object.values(data.errors).flat() as string[])
      else setErrors([data?.message || 'حدث خطأ، يرجى المحاولة مرة أخرى'])
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      await AdminPropertyTypesAPI.deleteType(itemToDelete.id)
      setItemToDelete(null)
      fetchTypes()
    } catch { setItemToDelete(null) }
  }

  const handleToggle = async (item: any) => {
    try {
      await AdminPropertyTypesAPI.toggleStatus(item.id)
      fetchTypes()
    } catch { /* ignore */ }
  }

  const toggleCategory = (id: string) => {
    setForm(prev => ({
      ...prev,
      property_category_ids: prev.property_category_ids.includes(id)
        ? prev.property_category_ids.filter(item => item !== id)
        : [...prev.property_category_ids, id],
    }))
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name_ar',
      header: 'نوع العقار',
      cell: ({ row }) => {
        const t = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Home className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">{t.name_ar || t.name || '—'}</p>
              {t.name_en && <p className="text-xs text-zinc-500">{t.name_en}</p>}
              {(t.property_categories || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {t.property_categories.map((category: any) => (
                    <span key={category.id} className="rounded border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 text-[11px] text-zinc-500">{entityName(category)}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
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
          <DropdownMenuContent align="end" className="w-44 dark:bg-zinc-900 dark:border-zinc-800">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(row.original)}>
              <Edit className="w-4 h-4" />تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleToggle(row.original)}>
              {row.original.status === 1 || row.original.status === true || row.original.status === 'active'
                ? <><XCircle className="w-4 h-4 text-orange-500" /><span className="text-orange-500">تعطيل</span></>
                : <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-emerald-500">تفعيل</span></>}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
              onClick={() => setItemToDelete(row.original)}
            >
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
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          أنواع العقارات
        </h1>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />إضافة نوع
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="البحث في أنواع العقارات..."
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
          emptyIcon={<Home className="h-5 w-5 text-zinc-400" />}
          emptyMessage="لا توجد أنواع عقارات مضافة حتى الآن."
        />
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md dark:bg-zinc-950 dark:border-zinc-800" dir="rtl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-zinc-900 dark:text-white">{editing ? 'تعديل النوع' : 'إضافة نوع جديد'}</SheetTitle>
          </SheetHeader>

          {errors.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم بالعربي <span className="text-red-500">*</span></Label>
              <Input value={form.name_ar} onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))} placeholder="مثال: شقة" />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input value={form.name_en} onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))} placeholder="e.g. Apartment" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>التصنيفات</Label>
              <div className="max-h-48 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800 p-2 space-y-1">
                {categories.length ? categories.map(category => {
                  const id = String(category.id)
                  return (
                    <label key={id} className="flex cursor-pointer items-center justify-between gap-3 rounded px-2 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <span className="text-zinc-700 dark:text-zinc-200">{entityName(category)}</span>
                      <input type="checkbox" className="h-4 w-4 accent-teal-600" checked={form.property_category_ids.includes(id)} onChange={() => toggleCategory(id)} />
                    </label>
                  )
                }) : <p className="px-2 py-3 text-sm text-zinc-500">لا توجد تصنيفات متاحة.</p>}
              </div>
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
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'حفظ التعديلات' : 'إضافة النوع'}
            </Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>إلغاء</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!itemToDelete} onOpenChange={open => !open && setItemToDelete(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-zinc-900 dark:text-zinc-100">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-zinc-500 dark:text-zinc-400">
              هل أنت متأكد من حذف "{itemToDelete?.name_ar || itemToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
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
