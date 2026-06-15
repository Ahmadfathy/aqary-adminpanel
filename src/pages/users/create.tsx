import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminLocationsAPI, AdminUsersAPI } from '@/lib/api-client'
import { entityName, errorMessages, unwrapList } from '@/lib/admin-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Check, ChevronDown, Eye, EyeOff, Loader2, Lock, Mail, MapPin, Phone, Search, User, UserPlus } from 'lucide-react'

export function CreateUserPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  type City = { id: number | string; [key: string]: any }
  const [cities, setCities] = useState<City[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  type FormData = {
    name: string
    first_name: string
    last_name: string
    email: string
    country_code: string
    mobile: string
    password: string
    password_confirmation: string
    user_type: string
    status: string
    city_ids: string[]
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    country_code: '+964',
    mobile: '',
    password: '',
    password_confirmation: '',
    user_type: 'admin',
    status: '1',
    city_ids: [],
  })

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await AdminLocationsAPI.getCities({ country_id: 104 })
        setCities(unwrapList(res, ['cities']))
      } catch {
        setCities([])
      }
    }
    fetchLocations()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleCity = (cityId: string) => {
    setFormData(prev => ({
      ...prev,
      city_ids: prev.city_ids.includes(cityId)
        ? prev.city_ids.filter(id => id !== cityId)
        : [...prev.city_ids, cityId],
    }))
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (formData.password !== formData.password_confirmation) {
      setErrors(['كلمة المرور وتأكيد كلمة المرور غير متطابقتين.'])
      return
    }

    setIsLoading(true)
    setErrors([])
    type Payload = Omit<FormData, 'status' | 'city_ids'> & { status: boolean; city_ids: number[] }
    const payload: Payload = {
      ...formData,
      name: formData.name || `${formData.first_name} ${formData.last_name}`.trim(),
      status: formData.status === '1',
      city_ids: formData.city_ids.map(id => Number(id)),
    }

    try {
      await AdminUsersAPI.createUser(payload)
      navigate('/users')
    } catch (err) {
      setErrors(errorMessages(err, 'حدث خطأ أثناء إضافة المشرف. يرجى المحاولة مرة أخرى.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
            إضافة مشرف جديد
          </h1>
          <p className="text-zinc-500 text-sm mt-1">قم بتعبئة بيانات المشرف لإضافته إلى النظام</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {errors.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                <ul className="list-disc list-inside space-y-1">{errors.map((error, idx) => <li key={idx}>{error}</li>)}</ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field icon={<User className="h-4 w-4 text-zinc-400" />} label="الاسم الأول">
                  <Input name="first_name" value={formData.first_name} onChange={handleChange} required className="pr-10" placeholder="محمد" />
                </Field>
                <Field icon={<User className="h-4 w-4 text-zinc-400" />} label="الاسم الأخير">
                  <Input name="last_name" value={formData.last_name} onChange={handleChange} required className="pr-10" placeholder="أحمد" />
                </Field>
                <Field icon={<Mail className="h-4 w-4 text-zinc-400" />} label="البريد الإلكتروني" >
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} dir="ltr" className="text-right pr-10" placeholder="example@email.com" />
                </Field>

                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <div className="flex h-9 overflow-hidden rounded-md border border-input focus-within:ring-1 focus-within:ring-ring">
                    <div className="flex shrink-0 items-center gap-1 border-l border-input bg-zinc-50 dark:bg-zinc-800/50 px-3 text-sm text-zinc-600 dark:text-zinc-400 select-none">
                      🇮🇶 <span>+964</span>
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-zinc-400" />
                      </div>
                      <Input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required dir="ltr" className="h-full rounded-none border-0 shadow-none text-right pr-10 focus-visible:ring-0" placeholder="7700000000" />
                    </div>
                  </div>
                </div>

                <PasswordInput label="كلمة المرور" name="password" value={formData.password} onChange={handleChange} required visible={showPassword} onToggle={() => setShowPassword(v => !v)} placeholder="********" />
                <PasswordInput label="تأكيد كلمة المرور" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required visible={showPasswordConfirmation} onToggle={() => setShowPasswordConfirmation(v => !v)} placeholder="********" />

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    المدن المُعيَّنة
                  </Label>
                  <MultiCitySelect cities={cities} selectedIds={formData.city_ids} onToggle={toggleCity} />
                </div>
                
                <div className="space-y-2">
                  <Label>حالة الحساب</Label>
                  <Select value={formData.status} onValueChange={val => handleSelectChange('status', val)} dir="rtl">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">نشط</SelectItem>
                      <SelectItem value="0">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <Button type="button" variant="outline" onClick={() => navigate('/users')}>إلغاء</Button>
                <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white gap-2 min-w-[120px]">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" />حفظ المشرف</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function Field({ label, icon, wide, children }: { label: string; icon: React.ReactNode; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-2 ${wide ? 'md:col-span-2' : ''}`}>
      <Label>{label}</Label>
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">{icon}</div>
        {children}
      </div>
    </div>
  )
}

function PasswordInput({ label, name, value, onChange, required, visible, onToggle, placeholder }: {
  label: string; name: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean; visible: boolean; onToggle: () => void; placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-zinc-400" />
        </div>
        <Input type={visible ? 'text' : 'password'} name={name} value={value} onChange={onChange} required={required} dir="ltr" className="px-10 text-right" placeholder={placeholder} />
        <button type="button" onClick={onToggle} className="absolute inset-y-0 left-0 flex w-10 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200" aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function MultiCitySelect({ cities, selectedIds, onToggle }: { cities: { id: number | string; [key: string]: any }[]; selectedIds: string[]; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const query = search.trim().toLowerCase()
  const filtered = query ? cities.filter(c => entityName(c).toLowerCase().includes(query)) : cities
  const selectedCities = cities.filter(c => selectedIds.includes(String(c.id)))

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div ref={ref} className="space-y-2">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <Input
          value={open ? search : ''}
          onFocus={() => setOpen(true)}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          placeholder={selectedIds.length === 0 ? 'ابحث واختر المدن...' : `${selectedIds.length} ${selectedIds.length === 1 ? 'مدينة محددة' : 'مدن محددة'} — ابحث للإضافة`}
          className="px-10"
        />
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500">لا توجد مدن مطابقة</div>
            ) : (
              filtered.map(city => {
                const cityId = String(city.id)
                const selected = selectedIds.includes(cityId)
                return (
                  <button
                    key={city.id}
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => onToggle(cityId)}
                    className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'bg-teal-600 border-teal-600' : 'border-zinc-300 dark:border-zinc-600'}`}>
                      {selected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span>{entityName(city)}</span>
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      {selectedCities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCities.map(city => (
            <span key={city.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20">
              {entityName(city)}
              <button type="button" onClick={() => onToggle(String(city.id))} className="font-bold hover:text-teal-900 dark:hover:text-teal-200 leading-none">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
