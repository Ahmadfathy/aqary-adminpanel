import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminLocationsAPI, AdminUsersAPI } from '@/lib/api-client'
import { entityName, errorMessages, unwrapList } from '@/lib/admin-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Check, ChevronDown, Eye, EyeOff, Loader2, Lock, Mail, Phone, Search, User, UserPlus } from 'lucide-react'

const countryCodes = ['+964', '+966', '+971', '+965', '+974', '+973', '+968', '+20']

export function CreateUserPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [formData, setFormData] = useState({
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
    city_ids: [] as string[],
  })

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const citiesResponse = await AdminLocationsAPI.getCities({ country_id: 104 })
        setCities(unwrapList(citiesResponse, ['cities']))
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'user_type' && value === 'admin' ? { city_ids: [] } : {}),
      ...(name === 'user_type' && value === 'supervisor' ? { city_ids: prev.city_ids.slice(0, 1) } : {}),
    }))
  }

  const selectSupervisorCity = (cityId: string) => {
    setFormData(prev => ({ ...prev, city_ids: cityId ? [cityId] : [] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.password_confirmation) {
      setErrors(['كلمة المرور وتأكيد كلمة المرور غير متطابقتين.'])
      return
    }
    if (formData.user_type === 'supervisor' && formData.city_ids.length !== 1) {
      setErrors(['يجب اختيار مدينة واحدة للمشرف.'])
      return
    }

    setIsLoading(true)
    setErrors([])
    const payload: any = { ...formData }
    payload.name = payload.name || `${payload.first_name} ${payload.last_name}`.trim()
    payload.status = payload.status === '1'
    if (payload.user_type === 'supervisor') {
      payload.city_ids = payload.city_ids.slice(0, 1).map(Number)
    } else {
      delete payload.city_ids
    }

    try {
      await AdminUsersAPI.createUser(payload)
      navigate('/users')
    } catch (err) {
      setErrors(errorMessages(err, 'حدث خطأ أثناء إضافة المستخدم. يرجى المحاولة مرة أخرى.'))
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
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">إضافة مستخدم جديد</h1>
          <p className="text-zinc-500 text-sm mt-1">أضف مدير أو مشرف للوحة الإدارة.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {errors.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                <ul className="list-disc list-inside space-y-1">{errors.map((error, idx) => <li key={idx}>{error}</li>)}</ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field icon={<User className="h-4 w-4 text-zinc-400" />} label="الاسم الأول"><Input name="first_name" value={formData.first_name} onChange={handleChange} required className="pr-10" placeholder="محمد" /></Field>
                <Field icon={<User className="h-4 w-4 text-zinc-400" />} label="الاسم الأخير"><Input name="last_name" value={formData.last_name} onChange={handleChange} required className="pr-10" placeholder="أحمد" /></Field>
                <Field icon={<Mail className="h-4 w-4 text-zinc-400" />} label="البريد الإلكتروني" wide><Input type="email" name="email" value={formData.email} onChange={handleChange} dir="ltr" className="text-right pr-10" placeholder="example@email.com" /></Field>

                <div className="space-y-2 md:col-span-2">
                  <Label>رقم الهاتف</Label>
                  <div className="flex gap-3">
                    <div className="w-32 shrink-0">
                      <Select value={formData.country_code} onValueChange={val => handleSelectChange('country_code', val)} dir="ltr">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{countryCodes.map(code => <SelectItem key={code} value={code}>{code}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-zinc-400" /></div>
                      <Input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required dir="ltr" className="text-right pr-10" placeholder="7700000000" />
                    </div>
                  </div>
                </div>

                <PasswordInput label="كلمة المرور" name="password" value={formData.password} onChange={handleChange} required visible={showPassword} onToggle={() => setShowPassword(value => !value)} placeholder="********" />
                <PasswordInput label="تأكيد كلمة المرور" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required visible={showPasswordConfirmation} onToggle={() => setShowPasswordConfirmation(value => !value)} placeholder="********" />

                <div className="space-y-2">
                  <Label>نوع الحساب</Label>
                  <Select value={formData.user_type} onValueChange={val => handleSelectChange('user_type', val)} dir="rtl">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="admin">مدير</SelectItem><SelectItem value="supervisor">مشرف</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>حالة الحساب</Label>
                  <Select value={formData.status} onValueChange={val => handleSelectChange('status', val)} dir="rtl">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="1">نشط</SelectItem><SelectItem value="0">غير نشط</SelectItem></SelectContent>
                  </Select>
                </div>

                {formData.user_type === 'supervisor' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>مدينة المشرف <span className="text-red-500">*</span></Label>
                    <SearchableCitySelect cities={cities} value={formData.city_ids[0] || ''} onChange={selectSupervisorCity} />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <Button type="button" variant="outline" onClick={() => navigate('/users')}>إلغاء</Button>
                <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white gap-2 min-w-[120px]">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" />حفظ المستخدم</>}
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

function PasswordInput({ label, name, value, onChange, required, visible, onToggle, placeholder }: { label: string; name: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; visible: boolean; onToggle: () => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-zinc-400" />
        </div>
        <Input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          dir="ltr"
          className="px-10 text-right"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 left-0 flex w-10 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
          aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function SearchableCitySelect({ cities, value, onChange }: { cities: any[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selectedCity = cities.find(city => String(city.id) === value)
  const query = search.trim().toLowerCase()
  const filteredCities = query
    ? cities.filter(city => entityName(city).toLowerCase().includes(query))
    : cities

  return (
    <div className="relative" onBlur={() => window.setTimeout(() => setOpen(false), 120)}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={open ? search : selectedCity ? entityName(selectedCity) : ''}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value)
            setOpen(true)
          }}
          placeholder="ابحث عن مدينة"
          className="bg-white px-10 dark:bg-zinc-950"
        />
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
          aria-label="فتح قائمة المدن"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {filteredCities.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-500">لا توجد مدن مطابقة</div>
          ) : (
            filteredCities.map(city => {
              const cityId = String(city.id)
              const selected = cityId === value
              return (
                <button
                  key={city.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(cityId)
                    setSearch('')
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-right text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <span>{entityName(city)}</span>
                  {selected && <Check className="h-4 w-4 text-teal-600" />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
