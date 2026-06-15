import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminUsersAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, MoreVertical, Trash2, CheckCircle2, XCircle, X, Phone, Mail, Calendar, Hash, MapPin, Building2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
} from "@/components/ui/alert-dialog"
import { DataTable } from '@/components/ui/data-table'

export function RealEstateOfficesPage() {
  const { t } = useTranslation('menu')
  const [offices, setOffices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [officeToDelete, setOfficeToDelete] = useState<number | null>(null)
  const [selectedOffice, setSelectedOffice] = useState<any>(null)

  const fetchOffices = async () => {
    setIsLoading(true)
    try {
      const response = await AdminUsersAPI.getUsers({ user_type: 'office' })
      let data = response.data?.data?.data || response.data?.data || response.data
      if (!Array.isArray(data)) {
        data = data?.items || data?.users || data?.data || []
      }
      setOffices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch offices", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOffices()
  }, [])

  const toggleStatus = async (id: number) => {
    try {
      await AdminUsersAPI.toggleStatus(id)
      fetchOffices()
      if (selectedOffice?.id === id) setSelectedOffice((o: any) => ({ ...o, status: !o.status }))
    } catch (error) {
      console.error("Failed to toggle status", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await AdminUsersAPI.deleteUser(id)
      setOfficeToDelete(null)
      setSelectedOffice(null)
      fetchOffices()
    } catch (error) {
      console.error("Failed to delete office", error)
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "المكتب",
        enableSorting: true,
        cell: ({ row }) => {
          const office = row.original
          const name = office.name || `${office.first_name || ''} ${office.last_name || ''}`.trim() || 'بدون إسم'
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                <AvatarImage src={office.avatar || office.profile_picture} />
                <AvatarFallback className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                  {name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <button
                  onClick={() => setSelectedOffice(office)}
                  className="font-medium text-zinc-900 dark:text-white text-sm hover:text-purple-600 dark:hover:text-purple-400 hover:underline text-right"
                >
                  {name}
                </button>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5" dir="ltr">
                  {office.email || ''}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "email",
        header: "البريد الإلكتروني",
        enableHiding: true,
        cell: ({ row }) => (
          <p dir="ltr" className="text-right text-sm text-zinc-600 dark:text-zinc-400">
            {row.original.email || '—'}
          </p>
        ),
      },
      {
        accessorKey: "mobile",
        header: "رقم الهاتف",
        enableHiding: true,
        cell: ({ row }) => (
          <p dir="ltr" className="text-right text-sm text-zinc-600 dark:text-zinc-400">
            {row.original.full_mobile || row.original.mobile || '—'}
          </p>
        ),
      },
      {
        accessorKey: "status",
        header: "الحالة",
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status
          const isActive = status === true || status === 'active' || status === 1 || status === '1'
          return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
            }`}>
              {isActive ? <><CheckCircle2 className="w-3.5 h-3.5" /> نشط</> : <><XCircle className="w-3.5 h-3.5" /> موقوف</>}
            </span>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: "تاريخ الانضمام",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString('ar-EG') : '—'}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => {
          const office = row.original
          const isActive = office.status === true || office.status === 'active' || office.status === 1 || office.status === '1'
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 dark:bg-zinc-900 dark:border-zinc-800">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setSelectedOffice(office)}>
                  <Building2 className="w-4 h-4" /> عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => toggleStatus(office.id)}>
                  {isActive ? (
                    <><XCircle className="w-4 h-4 text-orange-500" /> <span className="text-orange-500">إيقاف الحساب</span></>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-500">تفعيل الحساب</span></>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
                  onClick={() => setOfficeToDelete(office.id)}
                >
                  <Trash2 className="w-4 h-4" /> حذف المكتب
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          {t('realEstateOffices') || 'المكاتب العقارية'}
        </h1>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={offices}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="البحث بالاسم..."
          emptyIcon={<Search className="h-5 w-5 text-zinc-400" />}
          emptyMessage="لا يوجد مكاتب عقارية يطابقون بحثك"
        />
      </Card>

      {/* ── Office info modal ────────────────────────────────────────────── */}
      {selectedOffice && (
        <OfficeInfoModal
          office={selectedOffice}
          onClose={() => setSelectedOffice(null)}
          onToggleStatus={() => toggleStatus(selectedOffice.id)}
          onDelete={() => { setOfficeToDelete(selectedOffice.id); setSelectedOffice(null) }}
        />
      )}

      <AlertDialog open={officeToDelete !== null} onOpenChange={(open) => !open && setOfficeToDelete(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-zinc-900 dark:text-zinc-100">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-zinc-500 dark:text-zinc-400">
              هل أنت متأكد من حذف هذا المكتب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:flex-row-reverse sm:justify-start gap-2 mt-4">
            <AlertDialogCancel className="mt-0 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => officeToDelete && handleDelete(officeToDelete)}
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── Office info modal ──────────────────────────────────────────────────────────

function OfficeInfoModal({ office, onClose, onToggleStatus, onDelete }: {
  office: any
  onClose: () => void
  onToggleStatus: () => void
  onDelete: () => void
}) {
  const name = office.name || `${office.first_name || ''} ${office.last_name || ''}`.trim() || 'بدون إسم'
  const isActive = office.status === true || office.status === 'active' || office.status === 1 || office.status === '1'
  const phone = office.full_mobile || (office.country_code && office.mobile ? `${office.country_code}${office.mobile}` : office.mobile) || null
  const cities: any[] = Array.isArray(office.allowed_cities) ? office.allowed_cities : []
  const cityName = office.city?.name_ar || office.city?.name_en || office.city?.name || null
  const officeName = office.office_name || office.company_name || office.business_name || null
  const licenseNo = office.license_number || office.license_no || office.commercial_no || null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        dir="rtl"
        className="bg-white dark:bg-[#0f0f11] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h2 className="font-semibold text-zinc-900 dark:text-white">بيانات المكتب العقاري</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* avatar + name */}
        <div className="px-5 py-5 flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <Avatar className="h-16 w-16 border-2 border-zinc-200 dark:border-zinc-700">
            <AvatarImage src={office.avatar || office.profile_picture} />
            <AvatarFallback className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xl font-bold">
              {name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-zinc-900 dark:text-white text-lg leading-tight">{name}</p>
            {officeName && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{officeName}</p>}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20">
                مكتب عقاري
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                  : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
              }`}>
                {isActive ? 'نشط' : 'موقوف'}
              </span>
            </div>
          </div>
        </div>

        {/* info rows */}
        <div className="px-5 py-4 space-y-0.5 overflow-y-auto flex-1">
          <InfoRow icon={<Hash className="w-4 h-4" />} label="رقم المعرّف">
            <span className="text-zinc-700 dark:text-zinc-300">#{office.id}</span>
          </InfoRow>

          {office.email && (
            <InfoRow icon={<Mail className="w-4 h-4" />} label="البريد الإلكتروني">
              <span dir="ltr" className="text-zinc-700 dark:text-zinc-300">{office.email}</span>
            </InfoRow>
          )}

          {phone && (
            <InfoRow icon={<Phone className="w-4 h-4" />} label="رقم الهاتف">
              <span dir="ltr" className="text-zinc-700 dark:text-zinc-300">{phone}</span>
            </InfoRow>
          )}

          {cityName && (
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="المدينة">
              <span className="text-zinc-700 dark:text-zinc-300">{cityName}</span>
            </InfoRow>
          )}

          {cities.length > 0 && (
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="المدن المسموحة">
              <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                {cities.map((c: any, i: number) => (
                  <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {c?.name_ar || c?.name || c}
                  </span>
                ))}
              </div>
            </InfoRow>
          )}

          {licenseNo && (
            <InfoRow icon={<Building2 className="w-4 h-4" />} label="رقم الترخيص">
              <span dir="ltr" className="text-zinc-700 dark:text-zinc-300">{licenseNo}</span>
            </InfoRow>
          )}

          {office.created_at && (
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="تاريخ الانضمام">
              <span className="text-zinc-700 dark:text-zinc-300">
                {new Date(office.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </InfoRow>
          )}
        </div>

        {/* actions */}
        <div className="px-5 pb-5 pt-3 flex gap-2 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className={isActive
              ? 'gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-500/30 dark:hover:bg-orange-500/10'
              : 'gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10'}
            onClick={onToggleStatus}
          >
            {isActive ? <><XCircle className="w-4 h-4" />إيقاف</> : <><CheckCircle2 className="w-4 h-4" />تفعيل</>}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10 mr-auto"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" /> حذف
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0">
      <span className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
        {icon}{label}
      </span>
      <span className="text-sm font-medium text-left">{children}</span>
    </div>
  )
}

