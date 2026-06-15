import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AdminProfileAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Edit, Phone, Mail, UserCircle, MapPin, Calendar, CheckCircle2, Shield } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ProfileViewPage() {
  const { t: tc } = useTranslation('common')
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await AdminProfileAPI.getProfile()
        let user = response.data?.data?.data || response.data?.data || response.data;
        if (user && user.user) user = user.user;
        setProfile(user)
      } catch (err) {
        console.error("Failed to fetch profile", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 gap-4">
        <UserCircle className="w-16 h-16 text-zinc-300" />
        <p>{tc('profilePage.notFound')}</p>
        <Button onClick={() => window.location.reload()} variant="outline">{tc('btn.reload')}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-teal-600" />
            {tc('profilePage.title')}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{tc('profilePage.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/settings/profile/edit')} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
          <Edit className="w-4 h-4" />
          {tc('profilePage.editData')}
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card className="md:col-span-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 dark:from-teal-500/10 dark:to-emerald-500/10 relative">
            <div className="absolute -bottom-12 inset-x-0 flex justify-center">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-[#0f0f11] shadow-md bg-white dark:bg-zinc-900">
                <AvatarImage src={profile.avatar || profile.profile_picture} />
                <AvatarFallback className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-2xl font-bold">
                  {(profile.name || profile.first_name || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-16 pb-8 px-6 text-center">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || tc('profilePage.defaultName')}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Shield className="w-4 h-4 text-teal-500" />
              <span>{profile.user_type === 'admin' ? tc('profilePage.adminType') : profile.user_type || tc('users.types.user')}</span>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                profile.status === 1 || profile.status === true || profile.status === 'active'
                ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
              }`}>
                {profile.status === 1 || profile.status === true || profile.status === 'active' ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> {tc('profilePage.accountActive')}</>
                ) : (
                  <>{tc('profilePage.accountSuspended')}</>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f11] shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              {tc('profilePage.basicInfo')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                  <UserCircle className="w-4 h-4" />
                  <span>{tc('profilePage.firstName')}</span>
                </div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{profile.first_name || profile.name?.split(' ')[0] || '—'}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                  <UserCircle className="w-4 h-4" />
                  <span>{tc('profilePage.lastName')}</span>
                </div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{profile.last_name || profile.name?.split(' ').slice(1).join(' ') || '—'}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{tc('common.email')}</span>
                </div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100 rtl:text-right" dir="ltr">{profile.email || '—'}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{tc('common.phone')}</span>
                </div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100 rtl:text-right" dir="ltr">
                  {profile.country_code ? `${profile.country_code} ${profile.mobile}` : profile.mobile || '—'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{tc('common.country')}</span>
                </div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {profile.country_code === '+964' ? 'العراق 🇮🇶' :
                   profile.country_code === '+966' ? 'السعودية 🇸🇦' :
                   profile.country_code === '+971' ? 'الإمارات 🇦🇪' : tc('common.unspecified')}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{tc('common.joinDate')}</span>
                </div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
