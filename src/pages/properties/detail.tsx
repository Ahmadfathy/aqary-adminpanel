import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminPropertiesAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowRight, ArrowLeft, Home, MapPin, DollarSign, CheckCircle, Ban, Loader2, Trash2,
  User, Calendar, Maximize2, BedDouble, Bath, ChevronLeft, ChevronRight,
  Clock, Eye, Phone, Building2, Hash, AlertCircle, Sofa, HandshakeIcon,
  Layers, Wind, ImageOff, Car, Droplets, Shield, Flame, Wifi, Zap, Sun,
  Waves, Dumbbell, Leaf, Camera, Thermometer, PlayCircle, X, type LucideIcon,
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
  sale: 'property.detail.forSale',
  rent: 'property.detail.forRent',
  buy: 'property.detail.buyRequest',
}

const categoryName = (cat: any, tabu = ''): string => {
  const name = n(cat)
  if (!name) return ''
  return tabu ? `${tabu} ${name}` : name
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

function statusCfg(status: any, t: (k: string) => string) {
  if (status === 'approved' || status === 'active' || status === 1 || status === true)
    return {
      label: t('property.detail.statusApproved'), sub: t('property.detail.statusApprovedSub'), Icon: CheckCircle,
      banner: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      approved: true, rejected: false,
    }
  if (status === 'rejected' || status === 'suspended' || status === 0 || status === false)
    return {
      label: status === 'rejected' ? t('property.detail.statusRejected') : t('property.detail.statusSuspended'),
      sub: status === 'rejected' ? t('property.detail.statusRejectedSub') : t('property.detail.statusSuspendedSub'),
      Icon: Ban,
      banner: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30',
      text: 'text-red-700 dark:text-red-400',
      badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      approved: false, rejected: true,
    }
  return {
    label: t('property.detail.statusPending'), sub: t('property.detail.statusPendingSub'), Icon: Clock,
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
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 text-end">{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">{children}</h2>
}

type MediaItem = { type: 'image' | 'video'; url: string }

function extractMediaUrl(item: any): string {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.media_url || item.image_url || item.url || item.path || item.image || item.src || item.original || item.video_url || item.file || ''
}

function isVideoItem(item: any, url: string): boolean {
  return item?.type === 'video' || item?.media_type === 'video' || item?.is_video === true
    || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

// ── build media list ──────────────────────────────────────────────────────────

function buildMediaItems(prop: any): MediaItem[] {
  if (!prop) return []
  const seen = new Set<string>()
  const items: MediaItem[] = []
  const add = (item: any) => {
    const url = extractMediaUrl(item)
    if (!url || seen.has(url)) return
    seen.add(url)
    items.push({ type: isVideoItem(item, url) ? 'video' : 'image', url })
  }
  if (prop.primary_image) add(prop.primary_image)
  if (Array.isArray(prop.images)) prop.images.forEach(add)
  if (Array.isArray(prop.videos)) prop.videos.forEach(add)
  return items
}

// ── page ──────────────────────────────────────────────────────────────────────

export function PropertyDetailPage() {
  const { t: tc, i18n } = useTranslation('common')
  const isRtl = i18n.dir() === 'rtl'
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [property, setProperty] = useState<any>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeMedia, setActiveMedia] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [confirm, setConfirm] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const extract = (res: any) =>
    res.data?.data?.property ?? res.data?.data?.data ?? res.data?.data ?? res.data ?? null

  const reload = async () => {
    if (!id) return
    const res = await AdminPropertiesAPI.getProperty(id)
    const prop = extract(res)
    setProperty(prop)
    setMediaItems(buildMediaItems(prop))
    setActiveMedia(0)
  }

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setIsLoading(true)
      try {
        const res = await AdminPropertiesAPI.getProperty(id)
        const prop = extract(res)
        setProperty(prop)
        setMediaItems(buildMediaItems(prop))
        setActiveMedia(0)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [id])

  useEffect(() => {
    if (!lightboxOpen) return
    const n = mediaItems.length
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft' && n > 1) setActiveMedia(p => (p - 1 + n) % n)
      if (e.key === 'ArrowRight' && n > 1) setActiveMedia(p => (p + 1) % n)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxOpen, mediaItems.length])

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
        <p className="text-zinc-500 dark:text-zinc-400">{tc('property.detail.notFound')}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>{isRtl ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}{tc('btn.back')}</Button>
      </div>
    )

  // ── derived values ────────────────────────────────────────────────────────

  const s = statusCfg(property.status, tc)
  const SIcon = s.Icon

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })

  const ownerPhone = property.owner
    ? `${property.owner.country_code || ''}${property.owner.mobile || ''}`.trim()
    : null

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5" dir={i18n.dir()}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white mt-0.5 shrink-0">
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{property.title || tc('property.detail.noTitle')}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />#{property.id}
              </span>
              {property.purpose && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.badge}`}>
                  {purposeMap[property.purpose] ? tc(purposeMap[property.purpose]) : property.purpose}
                </span>
              )}
              {n(property.property_type) && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {n(property.property_type)}
                </span>
              )}
              {categoryName(property.property_category, tc('property.detail.tabu')) && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {categoryName(property.property_category, tc('property.detail.tabu'))}
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
            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 group">
              {mediaItems.length > 0 ? (
                <>
                  {mediaItems[activeMedia].type === 'video' ? (
                    <video
                      key={mediaItems[activeMedia].url}
                      src={mediaItems[activeMedia].url}
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={mediaItems[activeMedia].url}
                      alt={property.title}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightboxOpen(true)}
                    />
                  )}

                  {/* expand button */}
                  {mediaItems[activeMedia].type === 'image' && (
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}

                  {mediaItems.length > 1 && (
                    <>
                      <button onClick={() => setActiveMedia(p => (p - 1 + mediaItems.length) % mediaItems.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setActiveMedia(p => (p + 1) % mediaItems.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {activeMedia + 1} / {mediaItems.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-300 dark:text-zinc-700">
                  <ImageOff className="w-14 h-14" />
                  <span className="text-sm">{tc('property.detail.noMedia')}</span>
                </div>
              )}
            </div>

            {mediaItems.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-zinc-50 dark:bg-zinc-900/50">
                {mediaItems.map((item, i) => (
                  <button key={i} onClick={() => setActiveMedia(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition ${i === activeMedia ? 'border-teal-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-white/80" />
                      </div>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Quick stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Maximize2, label: tc('property.detail.area'), value: property.area_size ? `${parseFloat(property.area_size).toLocaleString()} ${tc('property.detail.sqm')}` : null },
              { icon: BedDouble, label: tc('property.detail.rooms'), value: property.rooms_count ?? null },
              { icon: Bath, label: tc('property.detail.bathrooms'), value: property.bathrooms_count ?? null },
              { icon: Home, label: tc('property.detail.halls'), value: property.halls_count ?? null },
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
              <SectionTitle>{tc('property.detail.description')}</SectionTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-loose whitespace-pre-line">{property.description}</p>
            </Card>
          )}

          {/* Features */}
          {Array.isArray(property.features) && property.features.length > 0 && (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
              <SectionTitle>{tc('property.detail.features')}</SectionTitle>
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
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{tc('property.detail.totalPrice')}</p>
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
                <HandshakeIcon className="w-3.5 h-3.5" />{tc('property.detail.negotiable')}
              </span>
            )}
          </Card>

          {/* Property details */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
            <SectionTitle>{tc('property.detail.details')}</SectionTitle>
            <Row icon={Home} label={tc('property.detail.type')} value={n(property.property_type)} />
            <Row icon={Building2} label={tc('property.detail.category')} value={categoryName(property.property_category, tc('property.detail.tabu'))} />
            <Row icon={Maximize2} label={tc('property.detail.area')} value={property.area_size ? `${parseFloat(property.area_size).toLocaleString()} ${tc('property.detail.sqm')}` : null} />
            <Row icon={Layers} label={tc('property.detail.floor')} value={property.details?.floor_label ? (floorMap[property.details.floor_label] || property.details.floor_label) : null} />
            <Row icon={Building2} label={tc('property.detail.buildingFloors')} value={property.building_floors_count} />
            <Row icon={Clock} label={tc('property.detail.buildingAge')} value={property.building_age ? `${property.building_age} ${tc('property.detail.year')}` : null} />
            <Row icon={Wind} label={tc('property.detail.facadeDirection')} value={property.details?.facade_direction ? (facadeMap[property.details.facade_direction] || property.details.facade_direction) : null} />
            <Row icon={Sofa} label={tc('property.detail.furnished')} value={property.is_furnished !== undefined ? (property.is_furnished ? tc('property.detail.yes') : tc('property.detail.no')) : null} />
            <Row icon={Calendar} label={tc('property.detail.addedDate')} value={property.created_at ? fmt(property.created_at) : null} />
            {property.approved_at && <Row icon={CheckCircle} label={tc('property.detail.approvedDate')} value={fmt(property.approved_at)} />}
          </Card>

          {/* Location */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
            <SectionTitle>{tc('property.detail.locationSection')}</SectionTitle>
            <Row icon={Building2} label={tc('property.detail.governorate')} value={n(property.governorate) || n(property.state) || n(property.province)} />
            <Row icon={Building2} label={tc('property.detail.city')} value={n(property.city)} />
            <Row icon={MapPin} label={tc('property.detail.region')} value={n(property.area)} />
            <Row icon={MapPin} label={tc('property.detail.address')} value={property.address || property.formatted_address} />
            {property.latitude && property.longitude && (
              <div className="pt-2.5">
                <a
                  href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />{tc('property.detail.viewOnMap')}
                </a>
              </div>
            )}
          </Card>

          {/* Owner */}
          {property.owner && (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
              <SectionTitle>{tc('property.detail.ownerInfo')}</SectionTitle>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{property.owner.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {property.owner.user_type === 'office' ? tc('offices.type')
                      : property.owner.user_type === 'agent' ? tc('property.detail.agentType')
                      : tc('property.detail.clientOwner')}
                  </p>
                </div>
              </div>
              {ownerPhone && (
                <Row icon={Phone} label={tc('property.detail.ownerPhone')} value={
                  <a href={`tel:${ownerPhone}`} className="text-teal-600 dark:text-teal-400 hover:underline" dir="ltr">
                    {ownerPhone}
                  </a>
                } />
              )}
              <Row icon={Eye} label={tc('property.detail.ownerId')} value={`#${property.owner.id}`} />
            </Card>
          )}

          {/* Approved by */}
          {property.approved_by && s.approved && (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5">
              <SectionTitle>{tc('property.detail.approvalInfo')}</SectionTitle>
              <Row icon={CheckCircle} label={tc('property.detail.approvedBy')} value={property.approved_by.name} />
              <Row icon={Calendar} label={tc('property.detail.approvalDate')} value={property.approved_at ? fmt(property.approved_at) : null} />
            </Card>
          )}

          {/* Status banner */}
          <div className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border px-4 py-3 ${s.banner}`}>
            <div className={`p-2 rounded-full self-start ${s.badge}`}>
              <SIcon className={`w-4 h-4 ${s.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${s.text}`}>{s.label}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.sub}</p>
              {property.rejection_reason && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {tc('property.detail.rejectionReason')} {property.rejection_reason}
                </p>
              )}
              {property.approved_at && s.approved && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  {tc('property.detail.approvedOnDate')} {fmt(property.approved_at)}
                  {property.approved_by && ` · ${tc('property.detail.by')} ${property.approved_by.name}`}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] p-5 space-y-2">
            <SectionTitle>{tc('property.detail.actions')}</SectionTitle>
            {!s.approved && (
              <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setConfirm('approve')}>
                <CheckCircle className="w-4 h-4" />{tc('property.detail.approveProperty')}
              </Button>
            )}
            {!s.rejected && (
              <Button variant="outline" className="w-full gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-500/30 dark:hover:bg-orange-500/10" onClick={() => setConfirm('reject')}>
                <Ban className="w-4 h-4" />{tc('property.detail.suspendProperty')}
              </Button>
            )}
            <Button variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10" onClick={() => setConfirm('delete')}>
              <Trash2 className="w-4 h-4" />{tc('btn.deletePermanent')}
            </Button>
          </Card>
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxOpen && mediaItems.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          {/* close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 end-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* counter */}
          {mediaItems.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full z-10">
              {activeMedia + 1} / {mediaItems.length}
            </span>
          )}

          {/* media */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-4 flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            {mediaItems[activeMedia].type === 'video' ? (
              <video
                key={mediaItems[activeMedia].url}
                src={mediaItems[activeMedia].url}
                controls
                autoPlay
                className="max-h-[90vh] max-w-full rounded-lg"
              />
            ) : (
              <img
                src={mediaItems[activeMedia].url}
                alt={property.title}
                className="max-h-[90vh] max-w-full object-contain rounded-lg select-none"
              />
            )}
          </div>

          {/* prev / next */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setActiveMedia(p => (p - 1 + mediaItems.length) % mediaItems.length) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setActiveMedia(p => (p + 1) % mediaItems.length) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* thumbnails strip */}
          {mediaItems.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 rounded-xl bg-black/50 overflow-x-auto max-w-[90vw]"
              onClick={e => e.stopPropagation()}
            >
              {mediaItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMedia(i)}
                  className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition ${i === activeMedia ? 'border-teal-400' : 'border-transparent opacity-50 hover:opacity-90'}`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-white/80" />
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Confirm dialog ────────────────────────────────────────────────── */}
      <AlertDialog open={confirm !== null} onOpenChange={open => !open && setConfirm(null)}>
        <AlertDialogContent className="dark:bg-[#0f0f11] dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start text-zinc-900 dark:text-zinc-100">
              {confirm === 'approve' && tc('property.detail.confirmApprove')}
              {confirm === 'reject' && tc('property.detail.confirmSuspend')}
              {confirm === 'delete' && tc('property.detail.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start text-zinc-500 dark:text-zinc-400">
              {confirm === 'approve' && tc('property.detail.confirmApproveMsg')}
              {confirm === 'reject' && tc('property.detail.confirmSuspendMsg')}
              {confirm === 'delete' && tc('property.detail.confirmDeleteMsg')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={`gap-2 mt-2 ${isRtl ? 'flex-row-reverse sm:flex-row-reverse sm:justify-start' : 'flex-row sm:justify-end'}`}>
            <AlertDialogCancel disabled={actionLoading} className="mt-0 border-zinc-200 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
              {tc('btn.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              className={confirm === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : confirm === 'reject' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
              onClick={() => {
                if (confirm === 'approve') act(() => AdminPropertiesAPI.approveProperty(id!))
                else if (confirm === 'reject') act(() => AdminPropertiesAPI.rejectProperty(id!, tc('property.rejectedByAdmin')))
                else if (confirm === 'delete') act(async () => { await AdminPropertiesAPI.deleteProperty(id!); navigate(-1) })
              }}
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin me-2" />}
              {confirm === 'approve' && tc('property.detail.approveProperty')}
              {confirm === 'reject' && tc('property.detail.suspendProperty')}
              {confirm === 'delete' && tc('btn.deletePermanent')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
