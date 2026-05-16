import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminUsersAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
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
    user_type: 'client',
    status: '1'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== (formData as any).password_confirmation) {
      setErrors(['كلمة المرور وتأكيد كلمة المرور غير متطابقتين.'])
      return
    }

    setIsLoading(true)
    setErrors([])
    
    // Auto fill name if empty
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
        // Collect all validation errors
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] overflow-hidden shadow-sm p-6 sm:p-8"
      >
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
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">الاسم الأول</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
                  placeholder="محمد"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">الاسم الأخير</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
                  placeholder="أحمد"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  dir="ltr"
                  className="block w-full text-right rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">رقم الهاتف</label>
              <div className="flex gap-3">
                <div className="w-32 shrink-0">
                  <select
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none cursor-pointer"
                    dir="ltr"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    className="block w-full text-right rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
                    placeholder="5X XXX XXXX"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  dir="ltr"
                  className="block w-full text-right rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
                  placeholder="********"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">تأكيد كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="password"
                  name="password_confirmation"
                  onChange={handleChange}
                  dir="ltr"
                  className="block w-full text-right rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
                  placeholder="********"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">نوع الحساب</label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 px-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none cursor-pointer"
              >
                <option value="client">عميل</option>
                <option value="office">مكتب عقاري</option>
                <option value="admin">مدير</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">حالة الحساب</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-2.5 px-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none cursor-pointer"
              >
                <option value="1">نشط</option>
                <option value="0">غير نشط</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/users')}
              className="border-zinc-200 dark:border-zinc-800"
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
      </motion.div>
    </div>
  )
}
