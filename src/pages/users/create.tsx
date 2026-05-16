import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminUsersAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowRight, UserPlus, Phone, Mail, Lock, User } from 'lucide-react'

const countryCodes = [
  { code: '+964', country: 'العراق', flag: '🇮🇶' },
  { code: '+966', country: 'السعودية', flag: '🇸🇦' },
  { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
  { code: '+965', country: 'الكويت', flag: '🇰🇼' },
  { code: '+974', country: 'قطر', flag: '🇶🇦' },
  { code: '+973', country: 'البحرين', flag: '🇧🇭' },
  { code: '+968', country: 'عمان', flag: '🇴🇲' },
  { code: '+20', country: 'مصر', flag: '🇪🇬' },
]

export function CreateUserPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    country_code: '+964',
    mobile: '',
    password: '',
    password_confirmation: '',
    user_type: 'client',
    status: '1'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.password_confirmation) {
      setErrors(['كلمة المرور وتأكيد كلمة المرور غير متطابقتين.'])
      return
    }

    setIsLoading(true)
    setErrors([])
    
    const payload = { ...formData }
    if (!payload.name) {
      payload.name = `${payload.first_name} ${payload.last_name}`.trim()
    }
    
    try {
      await AdminUsersAPI.createUser(payload)
      navigate('/users')
    } catch (err: any) {
      console.error("Failed to create user", err)
      const data = err.response?.data
      if (data?.errors) {
        const errorList = Object.values(data.errors).flat() as string[]
        setErrors(errorList.length > 0 ? errorList : [data.message || 'Validation error'])
      } else {
        setErrors([data?.message || 'حدث خطأ أثناء إضافة المستخدم. يرجى المحاولة مرة أخرى.'])
      }
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
            إضافة مستخدم جديد
          </h1>
          <p className="text-zinc-500 text-sm mt-1">قم بتعبئة بيانات المستخدم لإضافته إلى النظام</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {errors.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>الاسم الأول</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                    <Input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="pr-10"
                      placeholder="محمد"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>الاسم الأخير</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="pr-10"
                      placeholder="أحمد"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>البريد الإلكتروني</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-zinc-400" />
                    </div>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      dir="ltr"
                      className="text-right pr-10"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>رقم الهاتف</Label>
                  <div className="flex gap-3">
                    <div className="w-32 shrink-0">
                      <Select 
                        value={formData.country_code} 
                        onValueChange={(val) => handleSelectChange('country_code', val)}
                        dir="ltr"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-zinc-400" />
                      </div>
                      <Input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                        dir="ltr"
                        className="text-right pr-10"
                        placeholder="5X XXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>كلمة المرور</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-zinc-400" />
                    </div>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      dir="ltr"
                      className="text-right pr-10"
                      placeholder="********"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-zinc-400" />
                    </div>
                    <Input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      dir="ltr"
                      className="text-right pr-10"
                      placeholder="********"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>نوع الحساب</Label>
                  <Select value={formData.user_type} onValueChange={(val) => handleSelectChange('user_type', val)} dir="rtl">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">عميل</SelectItem>
                      <SelectItem value="office">مكتب عقاري</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>حالة الحساب</Label>
                  <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)} dir="rtl">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">نشط</SelectItem>
                      <SelectItem value="0">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/users')}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2 min-w-[120px]"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      حفظ المستخدم
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
