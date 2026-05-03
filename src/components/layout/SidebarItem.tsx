import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import type { MenuItem } from '../../lib/menu'
import { useSidebar } from '../../hooks/useSidebar'
import { useDirection } from '../../hooks/useDirection'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface SidebarItemProps {
  item: MenuItem
  level?: number
}

function isPathActive(item: MenuItem, currentPath: string): boolean {
  if (item.path && currentPath.startsWith(item.path)) {
    return true
  }
  if (item.children) {
    return item.children.some((child) => isPathActive(child, currentPath))
  }
  return false
}

export function SidebarItem({ item, level = 0 }: SidebarItemProps) {
  const { pathname } = useLocation()
  const { t } = useTranslation('menu')
  const { isCollapsed } = useSidebar()
  const { isRTL } = useDirection()

  const active = isPathActive(item, pathname)
  const [isOpen, setIsOpen] = useState(active)

  // Auto-expand if active route changes from outside
  useEffect(() => {
    if (active) setIsOpen(true)
  }, [active])

  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  const paddingStart = isCollapsed ? '0' : `${level * 12 + 16}px`
  
  const content = (
    <>
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon
            className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              active ? "text-brand" : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100"
            )}
          />
        )}
        {!isCollapsed && (
          <span
            className={cn(
              "text-sm font-medium transition-colors whitespace-nowrap",
              active ? "text-brand" : "text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-zinc-100"
            )}
          >
            {t(item.labelKey.replace('menu:', ''))}
          </span>
        )}
      </div>
      {!isCollapsed && hasChildren && (
        <motion.div
          animate={{ rotate: isOpen ? (isRTL ? 180 : 180) : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
        </motion.div>
      )}
    </>
  )

  const wrapperClassName = cn(
    "group flex w-full items-center justify-between rounded-lg py-2 my-0.5 transition-colors",
    active && !hasChildren ? "bg-brand/10 dark:bg-brand/20" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
    isCollapsed ? "justify-center px-0" : "px-4"
  )

  const ItemWrapper = isCollapsed && Icon ? (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full px-2">
             {hasChildren ? (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={wrapperClassName}
                >
                  {content}
                </button>
              ) : (
                <Link to={item.path || '#'} className={wrapperClassName}>
                  {content}
                </Link>
              )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={isRTL ? 'left' : 'right'} className="font-medium">
          {t(item.labelKey.replace('menu:', ''))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <div className={cn("w-full", isCollapsed ? "px-2" : "px-3")}>
      {hasChildren ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={wrapperClassName}
          style={{ paddingInlineStart: paddingStart }}
        >
          {content}
        </button>
      ) : (
        <Link 
          to={item.path || '#'} 
          className={cn(wrapperClassName, "relative")}
          style={{ paddingInlineStart: paddingStart }}
        >
          {active && !hasChildren && (
             <motion.div 
               layoutId="active-bar"
               className="absolute top-1 bottom-1 w-1 bg-brand rounded-full start-0"
             />
          )}
          {content}
        </Link>
      )}
    </div>
  )

  return (
    <div className="flex flex-col w-full">
      {ItemWrapper}
      
      {!isCollapsed && hasChildren && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex flex-col mt-1">
                {item.children!.map((child) => (
                  <SidebarItem key={child.id} item={child} level={level + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
