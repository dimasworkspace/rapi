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
          'flex min-h-11 flex-1 flex-col items-center justify-center py-1 text-[10px] font-bold transition-colors',
          isActive
            ? 'text-rapi-blue dark:text-white'
            : 'text-rapi-gray-600 hover:text-rapi-navy dark:text-rapi-dark-muted dark:hover:text-rapi-dark-ink',
        )
      }
    >
      {({ isActive }) => (
        // Tanpa kotak — tekan mengecil (bounce), aktif membesar + neon glow
        <motion.span
          className="flex flex-col items-center gap-0.5"
          whileTap={{ scale: 0.82 }}
          transition={SPRING_POP}
        >
          <motion.span
            animate={{ scale: isActive ? 1.3 : 1, y: isActive ? -2 : 0 }}
            transition={SPRING_POP}
            className={cn('flex', isActive && 'rapi-nav-glow')}
          >
            <Icon size={20} />
          </motion.span>
          <span>{label}</span>
          {/* Titik kuning bercahaya sebagai penanda aktif */}
          <span
            aria-hidden
            className={cn(
              'h-1 w-1 rounded-full bg-rapi-yellow transition-opacity',
              isActive ? 'rapi-dot-glow opacity-100' : 'opacity-0',
            )}
          />
        </motion.span>
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
