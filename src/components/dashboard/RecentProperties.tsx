import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AdminDashboardAPI } from '@/lib/api-client'
import { MapPin, Loader2, Building2 } from 'lucide-react'

export function RecentProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await AdminDashboardAPI.getRecentProperties()
        let data = response.data?.data?.data || response.data?.data || response.data;
        if (!Array.isArray(data)) {
           // Fallbacks if data is inside another property
           data = data?.items || data?.properties || data?.data || [];
        }
        setProperties(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch recent properties", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProperties()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] overflow-hidden"
    >
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">أحدث العقارات المضافة</h3>
        <span className="text-sm text-teal-500 hover:text-teal-600 cursor-pointer transition-colors">عرض الكل</span>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
            <Building2 className="w-12 h-12 mb-3 text-zinc-400" />
            <p>لا توجد عقارات حديثة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.slice(0, 5).map((property, i) => (
              <div key={property.id || i} className="flex items-center gap-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  {property.images?.[0]?.url ? (
                    <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building2 className="w-6 h-6 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{property.title || 'عقار بدون عنوان'}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {property.city?.name || property.city || 'مدينة غير محددة'}
                    </span>
                    <span className="font-semibold text-teal-500">{property.price?.toLocaleString()} {property.currency || 'IQD'}</span>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${property.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : property.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400' : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {property.status === 'approved' ? 'مقبول' : property.status === 'pending' ? 'معلق' : 'مرفوض'}
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
