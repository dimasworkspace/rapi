import { motion } from 'framer-motion'
import { Home, PieChart, TrendingUp, User, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { SPRING_POP } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

const LEFT_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/laporan', label: 'Laporan', icon: PieChart },
]

const RIGHT_ITEMS = [
  { to: '/investasi', label: 'Investasi', icon: TrendingUp },
  { to: '/profil', label: 'Profil', icon: User },
]

function NavItem({ to, label, icon: Icon }: (typeof LEFT_ITEMS)[number]) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1 text-[10px] font-bold transition-colors',
          isActive ? 'text-rapi-blue' : 'text-rapi-gray-600 hover:text-rapi-navy',
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
              className="absolute inset-x-1 inset-y-0.5 rounded-full bg-rapi-blue/10"
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
  const openAdd = useUiStore((s) => s.openAdd)
  const addOpen = useUiStore((s) => s.addOpen)

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
      <nav className="flex items-center rounded-full border border-white/60 bg-white/75 px-2 py-1.5 shadow-rapi-elevated backdrop-blur-xl">
        {LEFT_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <motion.button
          type="button"
          onClick={openAdd}
          aria-label="Tambah transaksi"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9 }}
          transition={SPRING_POP}
          className={cn(
            'mx-1 -mt-8 flex h-14 w-14 shrink-0 items-center justify-center',
            'rounded-full border-4 border-rapi-offwhite bg-rapi-blue text-white',
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

        {RIGHT_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </div>
  )
}
