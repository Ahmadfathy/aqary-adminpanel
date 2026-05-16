import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSidebar } from '../../hooks/useSidebar'
import { menu } from '../../lib/menu'
import { SidebarItem } from './SidebarItem'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '../../lib/utils'
import { useDirection } from '../../hooks/useDirection'
import { Sheet, SheetContent } from '../ui/sheet'

import logo from '../../assets/logo.png'

function SidebarContent() {
  const { isCollapsed } = useSidebar()
  const { isRTL } = useDirection()
  
  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 border-e dark:border-zinc-800">
      <div className={cn("flex h-16 shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800", isCollapsed ? "justify-center" : "px-6")}>
        <Link to="/" className="flex items-center gap-3 font-semibold text-zinc-900 dark:text-zinc-50 transition-colors hover:text-brand dark:hover:text-brand">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img src={logo} alt="Logo" className="h-full w-full object-contain" />
          </div>
          {!isCollapsed && <span className="text-xl tracking-tight">عقاري</span>}
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4" dir={isRTL ? "rtl" : "ltr"}>
        <nav className="flex flex-col gap-1 w-full">
          {menu.map((item) => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}

export function Sidebar() {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebar()
  const { isRTL } = useDirection()


  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        className="hidden lg:flex flex-col sticky top-0 h-screen z-50 overflow-hidden"
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side={isRTL ? "right" : "left"} className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
