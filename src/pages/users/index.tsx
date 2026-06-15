import { useEffect, useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminUsersAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserPlus, Search, MoreVertical, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
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

export function UsersPage() {
  const { t } = useTranslation('menu')
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const [adminResponse, supervisorResponse] = await Promise.all([
        AdminUsersAPI.getUsers({ user_type: 'admin' }),
        AdminUsersAPI.getUsers({ user_type: 'supervisor' }),
      ])
      setUsers([...extractUsers(adminResponse), ...extractUsers(supervisorResponse)])
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleStatus = useCallback(async (id: number) => {
    try {
      await AdminUsersAPI.toggleStatus(id)
      fetchUsers()
    } catch (error) {
      console.error("Failed to toggle status", error)
    }
  }, [fetchUsers])

  const handleDelete = async (id: number) => {
    try {
      await AdminUsersAPI.deleteUser(id)
      setUserToDelete(null)
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user", error)
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "المستخدم",
        enableSorting: true,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                <AvatarImage src={user.avatar || user.profile_picture} />
                <AvatarFallback className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
                  {(user.name || user.first_name || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-zinc-900 dark:text-white text-sm">
                  {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'بدون إسم'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5" dir="ltr">
                  {user.email || ''}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "email",
        header: "معلومات الاتصال",
        enableHiding: true,
        cell: ({ row }) => {
          const user = row.original
          return (
            <p dir="ltr" className="text-right text-sm text-zinc-600 dark:text-zinc-400">
              {user.mobile || '—'}
            </p>
          )
        },
      },
      {
        accessorKey: "user_type",
        header: "الدور",
        enableSorting: true,
        cell: ({ row }) => {
          const user_type = row.original.user_type
          return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              user_type === 'office'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400'
                : user_type === 'client'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
                : user_type === 'supervisor'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
            }`}>
              {user_type === 'admin' ? 'مدير' : user_type === 'supervisor' ? 'مشرف' : user_type === 'office' ? 'مكتب عقاري' : user_type === 'client' ? 'عميل' : user_type || 'مستخدم'}
            </span>
          )
        },
      },
      {
        accessorKey: "allowed_cities",
        header: "المدن المسموحة",
        enableSorting: false,
        cell: ({ row }) => {
          const label = allowedCitiesLabel(row.original)
          return (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {label}
            </span>
          )
        },
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
              {isActive ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> نشط</>
              ) : (
                <><XCircle className="w-3.5 h-3.5" /> موقوف</>
              )}
            </span>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: "تاريخ الانضمام",
        enableSorting: true,
        cell: ({ row }) => {
          const date = row.original.created_at
          return (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {date ? new Date(date).toLocaleDateString('ar-EG') : '—'}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original
          const isActive = user.status === true || user.status === 'active' || user.status === 1 || user.status === '1'
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 dark:bg-zinc-900 dark:border-zinc-800">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/users/${user.id}/edit`)}>
                  <Edit className="w-4 h-4" /> تعديل البيانات
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => toggleStatus(user.id)}>
                  {isActive ? (
                    <><XCircle className="w-4 h-4 text-orange-500" /> <span className="text-orange-500">إيقاف الحساب</span></>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-500">تفعيل الحساب</span></>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
                  onClick={() => setUserToDelete(user.id)}
                >
                  <Trash2 className="w-4 h-4" /> حذف المستخدم
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [navigate, toggleStatus]
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          {t('admins') || 'المشرفين'}
        </h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/users/create')}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة مشرف
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="البحث بالاسم..."
          emptyIcon={<Search className="h-5 w-5 text-zinc-400" />}
          emptyMessage="لا يوجد مستخدمين يطابقون بحثك"
        />
      </Card>

      <AlertDialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-zinc-900 dark:text-zinc-100">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-zinc-500 dark:text-zinc-400">
              هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة بياناته.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:flex-row-reverse sm:justify-start gap-2 mt-4">
            <AlertDialogCancel className="mt-0 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => userToDelete && handleDelete(userToDelete)}
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function extractUsers(response: any) {
  let data = response.data?.data?.data || response.data?.data || response.data
  if (!Array.isArray(data)) {
    data = data?.items || data?.users || data?.data || []
  }
  return Array.isArray(data) ? data : []
}

function allowedCitiesLabel(user: any) {
  const cities = user?.allowed_cities || user?.allowedCities || user?.cities || user?.admin_cities || user?.adminCities || []
  const list = Array.isArray(cities) ? cities : Object.values(cities || {})
  const names = list
    .map((city: any) => {
      if (city === null || city === undefined) return ''
      if (typeof city === 'string' || typeof city === 'number') return String(city)
      return city.name_ar || city.name || city.name_en || city.name_ku || city.title_ar || city.title || city.id || ''
    })
    .filter(Boolean)

  if (names.length) return names.join('، ')
  if (user?.user_type === 'admin') return 'كل المدن'
  return '—'
}
