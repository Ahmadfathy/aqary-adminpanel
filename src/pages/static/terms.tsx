import { useTranslation } from 'react-i18next'
import { Shield, FileText, AlertTriangle, Scale, Globe, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

export function TermsPage() {
  const { t } = useTranslation('common')

  const sections = [
    {
      icon: FileText,
      title: t('terms.sections.acceptance.title'),
      content: t('terms.sections.acceptance.content'),
    },
    {
      icon: Shield,
      title: t('terms.sections.services.title'),
      content: t('terms.sections.services.content'),
    },
    {
      icon: Scale,
      title: t('terms.sections.userObligations.title'),
      content: t('terms.sections.userObligations.content'),
    },
    {
      icon: AlertTriangle,
      title: t('terms.sections.liability.title'),
      content: t('terms.sections.liability.content'),
    },
    {
      icon: Globe,
      title: t('terms.sections.intellectualProperty.title'),
      content: t('terms.sections.intellectualProperty.content'),
    },
    {
      icon: Mail,
      title: t('terms.sections.contact.title'),
      content: t('terms.sections.contact.content'),
    },
  ]

  return (
    <div className="py-12 sm:py-16">
      {/* Hero */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('terms.title')}
          </h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            {t('terms.subtitle')}
          </p>
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
            {t('terms.lastUpdated')}: {t('terms.lastUpdatedDate')}
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors duration-300">
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA to Privacy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {t('terms.seeAlso')}{' '}
            <Link
              to="/privacy"
              className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              {t('static.privacyPolicy')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
