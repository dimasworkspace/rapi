import { motion } from 'framer-motion'
import { Home, PieChart, TrendingUp, User, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { SPRING_POP } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

interface NavItemData {
  to: string
  label: string
  icon: typeof Home
}

function NavItem({ to, label, icon: Icon }: NavItemData) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1 text-[10px] font-bold transition-colors',
          isActive
            ? 'text-rapi-blue dark:text-white'
            : 'text-rapi-gray-600 hover:text-rapi-navy dark:text-rapi-dark-muted dark:hover:text-rapi-dark-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Pill aktif meluncur antar tab (shared element, aturan shared-element-transition) */}
          {isActive && (
            <motion.span
              layoutId="rapi-nav-pill"
              transition={SPRING_POP}
              aria-hidden
              className="absolute inset-x-1 inset-y-0.5 rounded-full bg-rapi-blue/10 dark:bg-rapi-blue/40"
            />
          )}
          <Icon
            size={20}
            className={cn('relative transition-transform', isActive && '-translate-y-0.5 scale-110')}
          />
          <span className="relative">{label}</span>
          <span
            aria-hidden
            className={cn(
              'relative h-1 w-1 rounded-full bg-rapi-yellow transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      )}
    </NavLink>
  )
}

/** Floating pill nav — FAB Blue di tengah, sesuai wireframe (Home · Laporan · [+] · AI · Profil). */
export function BottomNav() {
  const t = useT()
  const openAdd = useUiStore((s) => s.openAdd)
  const addOpen = useUiStore((s) => s.addOpen)

  const leftItems: NavItemData[] = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/laporan', label: t.nav.reports, icon: PieChart },
  ]
  const rightItems: NavItemData[] = [
    { to: '/investasi', label: t.nav.investments, icon: TrendingUp },
    { to: '/profil', label: t.nav.profile, icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
      <nav className="flex items-center rounded-full border border-white/60 bg-white/75 px-2 py-1.5 shadow-rapi-elevated backdrop-blur-xl dark:border-white/10 dark:bg-rapi-dark-surface/80">
        {leftItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <motion.button
          type="button"
          onClick={openAdd}
          aria-label={t.add.title}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9 }}
          transition={SPRING_POP}
          className={cn(
            'mx-1 -mt-8 flex h-14 w-14 shrink-0 items-center justify-center',
            'rounded-full border-4 border-rapi-offwhite bg-rapi-blue text-white dark:border-rapi-dark',
            'animate-rapi-pulse',
          )}
        >
          {/* Plus muter jadi ✕ saat sheet kebuka — motion punya makna (aturan motion-meaning) */}
          <motion.span
            animate={{ rotate: addOpen ? 135 : 0 }}
            transition={SPRING_POP}
            className="flex"
          >
            <Plus size={26} strokeWidth={2.5} />
          </motion.span>
        </motion.button>

        {rightItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </div>
  )
}
