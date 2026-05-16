import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AdminDashboardAPI } from '@/lib/api-client'
import { User, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function RecentUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AdminDashboardAPI.getRecentUsers()
        let data = response.data?.data?.data || response.data?.data || response.data;
        if (!Array.isArray(data)) {
           data = data?.items || data?.users || data?.data || [];
        }
        setUsers(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch recent users", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] overflow-hidden"
    >
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">أحدث المستخدمين</h3>
        <span className="text-sm text-teal-500 hover:text-teal-600 cursor-pointer transition-colors">عرض الكل</span>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
            <User className="w-12 h-12 mb-3 text-zinc-400" />
            <p>لا يوجد مستخدمين جدد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.slice(0, 5).map((user, i) => (
              <div key={user.id || i} className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                  <AvatarImage src={user.avatar || user.profile_picture} />
                  <AvatarFallback className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    {(user.name || user.first_name || 'U').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.name || `${user.first_name} ${user.last_name}`.trim() || 'بدون إسم'}</h4>
                  <p className="text-xs text-zinc-500 truncate">{user.email || user.mobile}</p>
                </div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    user.user_type === 'office' ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400' :
                    user.user_type === 'client' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
                    'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}>
                    {user.user_type === 'office' ? 'مكتب عقاري' : user.user_type === 'client' ? 'عميل' : user.user_type || 'مستخدم'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
