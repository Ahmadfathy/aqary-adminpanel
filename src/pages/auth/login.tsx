import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Phone, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { AuthAPI } from '../../lib/api-client';
import logo from '../../assets/logo.png';

const countryCodes = [
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
];

export function LoginPage() {
  const { t } = useTranslation('common');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCode, setSelectedCode] = useState(countryCodes[0].code);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await AuthAPI.login({
        country_code: selectedCode,
        mobile: phone,
        password: password
      });
      
      // Attempt to extract token from various common API response structures
      const token = response.data?.token || response.data?.access_token || response.data?.data?.token || 'dummy-token';
      
      login(token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900"
      dir="rtl"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000"
        style={{ 
          backgroundImage: `url('/images/bg-iraq.png')`,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px]" />

      {/* Login Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative z-20 w-[90%] max-w-md p-6 sm:p-8 md:p-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
      >
        <div className="text-center mb-8 sm:mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-white/90 rounded-2xl mx-auto flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-teal-500/20 p-3"
          >
            <img src={logo} alt="Aqary Logo" className="w-full h-full object-contain drop-shadow-md" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t('auth.welcome')}</h1>
          <p className="text-slate-300 text-xs sm:text-sm">{t('auth.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">{t('auth.phone')}</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-32 order-1 sm:order-2">
                <select
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value)}
                  className="block w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 outline-none hover:bg-white/10 appearance-none cursor-pointer"
                  dir="ltr"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code} className="bg-slate-800 text-white">
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 order-2 sm:order-1">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 outline-none hover:bg-white/10 text-left"
                  placeholder="5X XXX XXXX"
                  dir="ltr"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">{t('auth.password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 outline-none hover:bg-white/10 text-left"
                placeholder="********"
                dir="ltr"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{t('auth.login')}</span>
                <LogIn className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs">
            {t('auth.terms')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
