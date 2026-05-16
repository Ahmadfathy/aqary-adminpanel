import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminPropertiesAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Loader2, Search, Filter, MoreVertical, Eye, Ban, Trash2, CheckCircle, Home, MapPin, DollarSign } from 'lucide-react'
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

export function PropertiesPage() {
  const { t } = useTranslation('menu')
  const navigate = useNavigate()
  const location = useLocation()
  
  const [properties, setProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null)

  // Determine purpose from URL path
  const purpose = location.pathname.includes('/sale') ? 'sale' : 
                  location.pathname.includes('/rent') ? 'rent' : 
                  location.pathname.includes('/buy') ? 'buy' : '';

  const getPageTitle = () => {
    if (purpose === 'sale') return 'عقارات للبيع'
    if (purpose === 'rent') return 'عقارات للإيجار'
    if (purpose === 'buy') return 'طلبات شراء'
    return 'جميع العقارات'
  }

  const fetchProperties = async () => {
    setIsLoading(true)
    try {
      const response = await AdminPropertiesAPI.getProperties({ search, purpose })
      let data = response.data?.data?.data || response.data?.data || response.data;
      if (!Array.isArray(data)) {
         data = data?.items || data?.properties || data?.data || [];
      }
      setProperties(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch properties", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProperties()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search, purpose])

  const handleApprove = async (id: number) => {
    try {
      await AdminPropertiesAPI.approveProperty(id)
      fetchProperties()
    } catch (error) {
      console.error("Failed to approve property", error)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await AdminPropertiesAPI.rejectProperty(id, "مرفوض من قبل الإدارة")
      fetchProperties()
    } catch (error) {
      console.error("Failed to reject property", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await AdminPropertiesAPI.deleteProperty(id)
      setPropertyToDelete(null)
      fetchProperties()
    } catch (error) {
      console.error("Failed to delete property", error)
    }
  }

  const getStatusBadge = (status: string | number | boolean) => {
    if (status === 'approved' || status === 1 || status === true || status === 'active') {
      return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"><CheckCircle className="w-3.5 h-3.5" /> معتمد</span>
    }
    if (status === 'rejected' || status === 'suspended' || status === 0 || status === false) {
      return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10"><Ban className="w-3.5 h-3.5" /> موقوف</span>
    }
    return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10"><Loader2 className="w-3.5 h-3.5" /> قيد المراجعة</span>
  }

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "العقار",
        cell: ({ row }) => {
          const property = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="h-12 w-16 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 relative">
                {property.cover_image || property.image ? (
                  <img src={property.cover_image || property.image} alt={property.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-400">
                    <Home className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-white line-clamp-1 max-w-[250px]">{property.title || property.name_ar || 'عقار بدون عنوان'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  رقم المرجع: {property.reference_number || property.id}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "price",
        header: "السعر",
        cell: ({ row }) => {
          const property = row.original
          return (
            <div className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-100">
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span dir="ltr">{property.price?.toLocaleString() || '0'} {property.currency || 'IQD'}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "location",
        header: "الموقع",
        cell: ({ row }) => {
          const property = row.original
          return (
            <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span className="line-clamp-1 max-w-[150px]">{property.address || property.city || property.location || 'غير محدد'}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "publisher",
        header: "الناشر",
        cell: ({ row }) => {
          const property = row.original
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{property.user?.name || property.owner_name || 'غير معروف'}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{property.user?.user_type === 'office' ? 'مكتب عقاري' : 'مالك / عميل'}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => {
          return getStatusBadge(row.original.status)
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const property = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 dark:bg-zinc-900 dark:border-zinc-800">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/real-estate/${property.id}`)}>
                  <Eye className="w-4 h-4" /> عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                
                {(property.status === 'pending' || property.status === 'suspended' || property.status === 0 || property.status === false || property.status === 'rejected') && (
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600" onClick={() => handleApprove(property.id)}>
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600">اعتماد العقار</span>
                  </DropdownMenuItem>
                )}
                
                {(property.status === 'approved' || property.status === 1 || property.status === true || property.status === 'active' || property.status === 'pending') && (
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-orange-50 dark:focus:bg-orange-500/10 focus:text-orange-600" onClick={() => handleReject(property.id)}>
                    <Ban className="w-4 h-4 text-orange-500" /> <span className="text-orange-600">إيقاف / رفض</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 font-medium" onClick={() => setPropertyToDelete(property.id)}>
                  <Trash2 className="w-4 h-4" /> حذف نهائي
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [navigate]
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          {getPageTitle()}
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-zinc-200 dark:border-zinc-800">
            <Filter className="w-4 h-4" />
            فلترة
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="البحث برقم العقار، العنوان أو اسم المالك..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={properties} 
          isLoading={isLoading} 
          emptyIcon={<Home className="h-5 w-5 text-zinc-400" />}
          emptyMessage="لا يوجد عقارات تطابق بحثك أو في هذا القسم."
        />
      </Card>

      <AlertDialog open={propertyToDelete !== null} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-zinc-900 dark:text-zinc-100">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-zinc-500 dark:text-zinc-400">
              هل أنت متأكد من حذف هذا العقار نهائياً؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة صوره وبياناته.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:flex-row-reverse sm:justify-start gap-2 mt-4">
            <AlertDialogCancel className="mt-0 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => propertyToDelete && handleDelete(propertyToDelete)}>حذف نهائي</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
