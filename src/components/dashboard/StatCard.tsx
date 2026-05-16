import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  color: string
  iconColor: string
  trend?: string
  trendUp?: boolean
  delay?: number
}

export function StatCard({ title, value, icon: Icon, color, iconColor, trend, trendUp, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-6 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${color} blur-3xl group-hover:scale-110 transition-transform duration-500`} />
      
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <span className={`flex items-center text-xs font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {trendUp ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  )
}
