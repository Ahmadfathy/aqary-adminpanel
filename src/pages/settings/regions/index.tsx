import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminLocationsAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, MoreVertical, Edit, Trash2, CheckCircle2, XCircle, Map } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

export function RegionsPage() {
  useTranslation('menu')
  const [regions, setRegions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchRegions = async () => {
    setIsLoading(true)
    try {
      const response = await AdminLocationsAPI.getRegions({ search }).catch(() => ({ data: { data: [] } }))
      let data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      if (!Array.isArray(data)) {
        data = data?.items || data?.regions || data?.data || [];
      }
      setRegions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch regions", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRegions()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "المنطقة",
        cell: ({ row }) => {
          const region = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Map className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">{region.name_ar || region.name || 'بدون إسم'}</p>
                <p className="text-xs text-zinc-500">{region.name_en || ''}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "city",
        header: "المدينة",
        cell: ({ row }) => {
          const region = row.original
          return <span className="text-zinc-700 dark:text-zinc-300">{region.city?.name_ar || region.city_name || '—'}</span>
        },
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => {
          const isActive = row.original.status === 1 || row.original.status === true || row.original.status === 'active'
          return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
            }`}>
              {isActive ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> نشط</>
              ) : (
                <><XCircle className="w-3.5 h-3.5" /> غير نشط</>
              )}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        cell: () => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 dark:bg-zinc-900 dark:border-zinc-800">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Edit className="w-4 h-4" /> تعديل
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10">
                  <Trash2 className="w-4 h-4" /> حذف
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
          المناطق
        </h1>
        <div className="flex items-center gap-3">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            إضافة منطقة
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="البحث في المناطق..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={regions}
          isLoading={isLoading}
          emptyIcon={<Map className="h-5 w-5 text-zinc-400" />}
          emptyMessage="لا يوجد مناطق مضافة حتى الآن."
        />
      </Card>
    </div>
  )
}
