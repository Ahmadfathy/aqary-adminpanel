import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminDashboardAPI } from '@/lib/api-client'
import { Users, Home, Calendar, Handshake, Loader2 } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentProperties } from '@/components/dashboard/RecentProperties'
import { RecentUsers } from '@/components/dashboard/RecentUsers'

export function DashboardPage() {
  const { t } = useTranslation('menu')
  const { t: tc } = useTranslation('common')
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await AdminDashboardAPI.getStats()
        setStats(response.data?.data || response.data || {})
      } catch (error) {
        console.error("Failed to fetch stats", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: tc('dashboard.totalUsers'),
      value: stats?.users?.total ?? stats?.total_users ?? stats?.users_count ?? 0,
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-cyan-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: tc('dashboard.properties'),
      value: stats?.properties?.total ?? stats?.total_properties ?? stats?.properties_count ?? 0,
      icon: Home,
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-500',
      trend: '+5%',
      trendUp: true
    },
    {
      title: tc('dashboard.appointments'),
      value: stats?.appointments?.total ?? stats?.total_appointments ?? stats?.appointments_count ?? 0,
      icon: Calendar,
      color: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-500',
      trend: '-2%',
      trendUp: false
    },
    {
      title: tc('dashboard.deals'),
      value: stats?.deals?.total ?? stats?.total_deals ?? stats?.deals_count ?? 0,
      icon: Handshake,
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-500',
      trend: '+18%',
      trendUp: true
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          {t('dashboard')}
        </h1>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, i) => (
              <StatCard key={i} {...stat} delay={i * 0.1} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-6">
              <RecentProperties />
            </div>
            <div className="space-y-6">
              <RecentUsers />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
