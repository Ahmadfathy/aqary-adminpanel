import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminUsersAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, MoreVertical, Trash2, CheckCircle2, XCircle } from 'lucide-react'
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
    } catch (error) {
      console.error("Failed to toggle status", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await AdminUsersAPI.deleteUser(id)
      setOfficeToDelete(null)
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
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                <AvatarImage src={office.avatar || office.profile_picture} />
                <AvatarFallback className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                  {(office.name || office.first_name || 'M').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-zinc-900 dark:text-white text-sm">
                  {office.name || `${office.first_name || ''} ${office.last_name || ''}`.trim() || 'بدون إسم'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5" dir="ltr">
                  {office.email || ''}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "mobile",
        header: "رقم الهاتف",
        enableHiding: true,
        cell: ({ row }) => (
          <p dir="ltr" className="text-right text-sm text-zinc-600 dark:text-zinc-400">
            {row.original.mobile || '—'}
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
