import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminPropertiesAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowRight, Home, MapPin, DollarSign, CheckCircle, Ban, Loader2, Trash2,
  User, Calendar, Maximize2, BedDouble, Bath, ChevronLeft, ChevronRight,
  Clock, Eye, Phone, Globe, Building2, Hash, AlertCircle, Sofa, HandshakeIcon,
  Layers, Wind, ImageOff, Car, Droplets, Shield, Flame, Wifi, Zap, Sun,
  Waves, Dumbbell, Leaf, Camera, Thermometer, type LucideIcon,
} from 'lucide-react'

const featureIcons: Record<string, LucideIcon> = {
  elevator: Layers,
  water_tank: Droplets,
  guard: Shield,
  central_heating: Flame,
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
  garden: Leaf,
  solar: Sun,
  generator: Zap,
  camera: Camera,
  internet: Wifi,
  wifi: Wifi,
  air_conditioning: Wind,
  furnished: Sofa,
  heating: Thermometer,
  balcony: Home,
}

// ── helpers ───────────────────────────────────────────────────────────────────

const n = (val: any): string => {
  if (!val) return ''
  if (typeof val === 'object') return val.name_ar || val.name_en || val.name || ''
  return String(val)
}

const purposeMap: Record<string, string> = {
  sale: 'للبيع', rent: 'للإيجار', buy: 'طلب شراء',
}

const categoryName = (cat: any): string => {
  const name = n(cat)
  if (!name) return ''
  return `طابو ${name}`
}

const facadeMap: Record<string, string> = {
  east: 'شرقية', west: 'غربية', north: 'شمالية', south: 'جنوبية',
  northeast: 'شمال شرقية', northwest: 'شمال غربية',
  southeast: 'جنوب شرقية', southwest: 'جنوب غربية',
}

const floorMap: Record<string, string> = {
  ground: 'أرضي', basement: 'قبو',
  first: 'الأول', second: 'الثاني', third: 'الثالث',
  fourth: 'الرابع', fifth: 'الخامس', sixth: 'السادس',
  seventh: 'السابع', eighth: 'الثامن', ninth: 'التاسع', tenth: 'العاشر',
}

// ── status ────────────────────────────────────────────────────────────────────

function statusCfg(status: any) {
  if (status === 'approved' || status === 'active' || status === 1 || status === true)
    return {
      label: 'تم الموافقة', sub: 'العقار معتمد ومنشور للمستخدمين', Icon: CheckCircle,
      banner: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      approved: true, rejected: false,
    }
  if (status === 'rejected' || status === 'suspended' || status === 0 || status === false)
    return {
      label: status === 'rejected' ? 'مرفوض' : 'موقوف',
      sub: status === 'rejected' ? 'تم رفض العقار من قبل الإدارة' : 'تم إيقاف العقار مؤقتاً',
      Icon: Ban,
      banner: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30',
      text: 'text-red-700 dark:text-red-400',
      badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      approved: false, rejected: true,
    }
  return {
    label: 'قيد المراجعة', sub: 'بانتظار مراجعة الإدارة والموافقة عليه', Icon: Clock,
    banner: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    approved: false, rejected: false,
  }
}

// ── detail row ────────────────────────────────────────────────────────────────

function Row({ icon: Icon, label, value }: { icon: any; label: string; value?: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
        <Icon className="w-4 h-4" />{label}
      </span>
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 text-left">{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">{children}</h2>
}

// ── page ──────────────────────────────────────────────────────────────────────

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [property, setProperty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [confirm, setConfirm] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const extract = (res: any) =>
    res.data?.data?.property ?? res.data?.data?.data ?? res.data?.data ?? res.data ?? null

  const reload = async () => {
    if (!id) return
    const res = await AdminPropertiesAPI.getProperty(id)
    setProperty(extract(res))
  }

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setIsLoading(true)
      try {
        const res = await AdminPropertiesAPI.getProperty(id)
        setProperty(extract(res))
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [id])

  const act = async (fn: () => Promise<any>) => {
    setActionLoading(true)
    try { await fn(); await reload() }
    catch (e) { console.error(e) }
    finally { setActionLoading(false); setConfirm(null) }
  }

  // ── loading / not-found ───────────────────────────────────────────────────

  if (isLoading)
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>

  if (!property)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Home className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
        <p className="text-zinc-500 dark:text-zinc-400">لم يتم العثور على العقار</p>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowRight className="w-4 h-4 ml-2" />العودة</Button>
      </div>
    )

  // ── derived values ────────────────────────────────────────────────────────

  const s = statusCfg(property.status)
  const SIcon = s.Icon

  // images: primary_image first, then images array
  const imgs: string[] = []
  if (property.primary_image) imgs.push(property.primary_image)
  if (Array.isArray(property.images))
    property.images.forEach((img: any) => {
      const url = typeof img === 'string' ? img : img?.url || img?.path || img?.image || ''
      if (url && !imgs.includes(url)) imgs.push(url)
    })

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })

  const ownerPhone = property.owner
    ? `${property.owner.country_code || ''}${property.owner.mobile || ''}`.trim()
    : null

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5" dir="rtl">

      {/* ── Status banner ────────────────────────────────────────────────── */}
      <div className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border px-5 py-4 ${s.banner}`}>
        <div className={`p-2.5 rounded-full self-start ${s.badge}`}>
          <SIcon className={`w-5 h-5 ${s.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-lg ${s.text}`}>{s.label}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.sub}</p>
          {property.rejection_reason && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              سبب الرفض: {property.rejection_reason}
            </p>
          )}
          {property.approved_at && s.approved && (
            <p className="text-xs text-zinc-400 mt-1">
              تمت الموافقة بتاريخ {fmt(property.approved_at)}
              {property.approved_by && ` · بواسطة ${property.approved_by.name}`}
            </p>
          )}
        </div>
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white mt-0.5 shrink-0">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{property.title || 'عقار بدون عنوان'}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />#{property.id}
              </span>
              {property.purpose && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.badge}`}>
                  {purposeMap[property.purpose] || property.purpose}
                </span>
              )}
              {n(property.property_type) && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {n(property.property_type)}
                </span>
              )}
              {categoryName(property.property_category) && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {categoryName(property.property_category)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: images + description + features */}
        <div className="lg:col-span-2 space-y-5">

          {/* Gallery */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] overflow-hidden">
            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900">
              {imgs.length > 0 ? (
                <>
                  <img src={imgs[activeImg]} alt={property.title} className="w-full h-full object-cover" />
                  {imgs.length > 1 && (
                    <>
                      <button onClick={() => setActiveImg(p => (p - 1 + imgs.length) % imgs.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setActiveImg(p => (p + 1) % imgs.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {activeImg + 1} / {imgs.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-300 dark:text-zinc-700">
                  <ImageOff className="w-14 h-14" />
                  <span className="text-sm">لا توجد صور</span>
                </div>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-zinc-50 dark:bg-zinc-900/50">
                {imgs.map((url, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition ${i === activeImg ? 'border-teal-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Quick stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Maximize2, label: 'المساحة', value: property.area_size ? `${parseFloat(property.area_size).toLocaleString()} م²` : null },
              { icon: BedDouble, label: 'الغرف', value: property.rooms_count ?? null },
              { icon: Bath, label: 'الحمامات', value: property.bathrooms_count ?? null },
              { icon: Home, label: 'الصالات', value: property.halls_count ?? null },
            ].filter(x => x.value !== null).map(({ icon: Icon, label, value }) => (
              <Card key={label} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-4 flex flex-col items-center gap-1">
                <Icon className="w-5 h-5 text-teal-600" />
                <span className="text-lg font-bold text-zinc-900 dark:text-white">{value}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
              </Card>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
              <SectionTitle>وصف العقار</SectionTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-loose whitespace-pre-line">{property.description}</p>
            </Card>
          )}

          {/* Features */}
          {Array.isArray(property.features) && property.features.length > 0 && (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
              <SectionTitle>المميزات والخدمات</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f: any) => {
                  const FIcon = featureIcons[f.code] ?? CheckCircle
                  return (
                    <span key={f.id}
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20">
                      <FIcon className="w-3.5 h-3.5" />
                      {f.name_ar || f.name}
                    </span>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT: price + details + location + owner */}
        <div className="space-y-4">

          {/* Price */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">السعر الإجمالي</p>
            <div className="flex items-baseline gap-1.5">
              <DollarSign className="w-5 h-5 text-teal-600" />
              <span className="text-2xl font-bold text-zinc-900 dark:text-white" dir="ltr">
                {parseFloat(property.price || '0').toLocaleString()}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{property.currency || 'IQD'}</span>
            </div>
            {property.meter_price && (
              <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {parseFloat(property.meter_price).toLocaleString()} {property.currency || 'IQD'} / م²
              </p>
            )}
            {property.is_negotiable && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full">
                <HandshakeIcon className="w-3.5 h-3.5" />قابل للتفاوض
              </span>
            )}
          </Card>

          {/* Property details */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
            <SectionTitle>تفاصيل العقار</SectionTitle>
            <Row icon={Home} label="نوع العقار" value={n(property.property_type)} />
            <Row icon={Building2} label="تصنيف العقار" value={categoryName(property.property_category)} />
            <Row icon={Maximize2} label="المساحة" value={property.area_size ? `${parseFloat(property.area_size).toLocaleString()} م²` : null} />
            <Row icon={Layers} label="الطابق" value={property.details?.floor_label ? (floorMap[property.details.floor_label] || property.details.floor_label) : null} />
            <Row icon={Building2} label="عدد طوابق المبنى" value={property.building_floors_count} />
            <Row icon={Clock} label="عمر البناء" value={property.building_age ? `${property.building_age} سنة` : null} />
            <Row icon={Wind} label="اتجاه الواجهة" value={property.details?.facade_direction ? (facadeMap[property.details.facade_direction] || property.details.facade_direction) : null} />
            <Row icon={Sofa} label="مفروش" value={property.is_furnished !== undefined ? (property.is_furnished ? 'نعم' : 'لا') : null} />
            <Row icon={Calendar} label="تاريخ الإضافة" value={property.created_at ? fmt(property.created_at) : null} />
            {property.approved_at && <Row icon={CheckCircle} label="تاريخ الموافقة" value={fmt(property.approved_at)} />}
          </Card>

          {/* Location */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
            <SectionTitle>الموقع</SectionTitle>
            <Row icon={Globe} label="الدولة" value={n(property.country)} />
            <Row icon={Building2} label="المدينة" value={n(property.city)} />
            <Row icon={MapPin} label="المنطقة" value={n(property.area)} />
            <Row icon={MapPin} label="العنوان التفصيلي" value={property.address || property.formatted_address} />
            {property.latitude && property.longitude && (
              <div className="pt-2.5">
                <a
                  href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />عرض على خرائط Google
                </a>
              </div>
            )}
          </Card>

          {/* Owner */}
          {property.owner && (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
              <SectionTitle>معلومات المالك</SectionTitle>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{property.owner.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {property.owner.user_type === 'office' ? 'مكتب عقاري'
                      : property.owner.user_type === 'agent' ? 'وسيط عقاري'
                      : 'عميل / مالك'}
                  </p>
                </div>
              </div>
              {ownerPhone && (
                <Row icon={Phone} label="الهاتف" value={
                  <a href={`tel:${ownerPhone}`} className="text-teal-600 dark:text-teal-400 hover:underline" dir="ltr">
                    {ownerPhone}
                  </a>
                } />
              )}
              <Row icon={Eye} label="رقم المالك" value={`#${property.owner.id}`} />
            </Card>
          )}

          {/* Approved by */}
          {property.approved_by && s.approved && (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
              <SectionTitle>معلومات الاعتماد</SectionTitle>
              <Row icon={CheckCircle} label="اعتمد بواسطة" value={property.approved_by.name} />
              <Row icon={Calendar} label="تاريخ الاعتماد" value={property.approved_at ? fmt(property.approved_at) : null} />
            </Card>
          )}

          {/* Actions */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5 space-y-2">
            <SectionTitle>إجراءات</SectionTitle>
            {!s.approved && (
              <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setConfirm('approve')}>
                <CheckCircle className="w-4 h-4" />اعتماد العقار
              </Button>
            )}
            {!s.rejected && (
              <Button variant="outline" className="w-full gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-500/30 dark:hover:bg-orange-500/10" onClick={() => setConfirm('reject')}>
                <Ban className="w-4 h-4" />إيقاف العقار
              </Button>
            )}
            <Button variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10" onClick={() => setConfirm('delete')}>
              <Trash2 className="w-4 h-4" />حذف نهائي
            </Button>
          </Card>
        </div>
      </div>

      {/* ── Confirm dialog ────────────────────────────────────────────────── */}
      <AlertDialog open={confirm !== null} onOpenChange={open => !open && setConfirm(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-zinc-900 dark:text-zinc-100">
              {confirm === 'approve' && 'تأكيد اعتماد العقار'}
              {confirm === 'reject' && 'تأكيد إيقاف العقار'}
              {confirm === 'delete' && 'تأكيد الحذف النهائي'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right text-zinc-500 dark:text-zinc-400">
              {confirm === 'approve' && 'سيتم اعتماد العقار ونشره للمستخدمين. هل تريد المتابعة؟'}
              {confirm === 'reject' && 'سيتم إيقاف العقار وإخفاؤه عن المستخدمين. هل تريد المتابعة؟'}
              {confirm === 'delete' && 'سيتم حذف العقار نهائياً مع جميع بياناته وصوره. لا يمكن التراجع عن هذا الإجراء.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:flex-row-reverse sm:justify-start gap-2 mt-2">
            <AlertDialogCancel disabled={actionLoading} className="mt-0 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              className={confirm === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : confirm === 'reject' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
              onClick={() => {
                if (confirm === 'approve') act(() => AdminPropertiesAPI.approveProperty(id!))
                else if (confirm === 'reject') act(() => AdminPropertiesAPI.rejectProperty(id!, 'مرفوض من قبل الإدارة'))
                else if (confirm === 'delete') act(async () => { await AdminPropertiesAPI.deleteProperty(id!); navigate(-1) })
              }}
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {confirm === 'approve' && 'اعتماد العقار'}
              {confirm === 'reject' && 'إيقاف العقار'}
              {confirm === 'delete' && 'حذف نهائي'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
