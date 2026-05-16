import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AdminUsersAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2, UserPlus, Search, Filter, MoreVertical, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function UsersPage() {
  const { t } = useTranslation('menu')
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await AdminUsersAPI.getUsers({ search })
      let data = response.data?.data?.data || response.data?.data || response.data;
      if (!Array.isArray(data)) {
         data = data?.items || data?.users || data?.data || [];
      }
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const toggleStatus = async (id: number) => {
    try {
      await AdminUsersAPI.toggleStatus(id)
      fetchUsers()
    } catch (error) {
      console.error("Failed to toggle status", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          {t('userManagement') || 'إدارة المستخدمين'}
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-zinc-200 dark:border-zinc-800">
            <Filter className="w-4 h-4" />
            فلترة
          </Button>
          <Button onClick={() => navigate('/users/create')} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            <UserPlus className="w-4 h-4" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="البحث بالاسم، البريد أو رقم الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>

        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">المستخدم</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">معلومات الاتصال</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">الدور</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">الحالة</TableHead>
                <TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">تاريخ الانضمام</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-500 mb-2" />
                      <p className="text-sm">جاري تحميل البيانات...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                        <Search className="h-5 w-5 text-zinc-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">لا يوجد مستخدمين</p>
                      <p className="text-xs mt-1">لم يتم العثور على أي مستخدمين يطابقون بحثك.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, idx) => {
                  const isActive = user.status === true || user.status === 'active' || user.status === 1 || user.status === '1';
                  return (
                  <TableRow key={user.id || idx} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                          <AvatarImage src={user.avatar || user.profile_picture} />
                          <AvatarFallback className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
                            {(user.name || user.first_name || 'U').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'بدون إسم'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      <p dir="ltr" className="text-right">{user.email || user.mobile}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.user_type === 'office' ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400' :
                        user.user_type === 'client' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
                        'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {user.user_type === 'office' ? 'مكتب عقاري' : user.user_type === 'client' ? 'عميل' : user.user_type || 'مستخدم'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isActive ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
                      }`}>
                        {isActive ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> نشط</>
                        ) : (
                          <><XCircle className="w-3.5 h-3.5" /> موقوف</>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '—'}
                    </TableCell>
                    <TableCell>
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
                          <DropdownMenuItem className="gap-2 cursor-pointer text-red-500 focus:text-red-500">
                            <Trash2 className="w-4 h-4" /> حذف المستخدم
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
