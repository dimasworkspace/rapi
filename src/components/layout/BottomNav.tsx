import { Home, PieChart, TrendingUp, User, Plus } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

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
          'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1 text-[10px] font-bold transition-all',
          isActive ? 'text-rapi-blue' : 'text-rapi-gray-600 hover:text-rapi-navy',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={cn('transition-transform', isActive && '-translate-y-0.5 scale-110')} />
          {label}
          <span
            aria-hidden
            className={cn(
              'h-1 w-1 rounded-full bg-rapi-yellow transition-opacity',
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
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
      <nav className="flex items-center rounded-full border border-white/60 bg-white/75 px-2 py-1.5 shadow-rapi-elevated backdrop-blur-xl">
        {LEFT_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <button
          type="button"
          onClick={() => navigate('/tambah')}
          aria-label="Tambah transaksi"
          className={cn(
            'mx-1 -mt-8 flex h-14 w-14 shrink-0 items-center justify-center',
            'rounded-full border-4 border-rapi-offwhite bg-rapi-blue text-white',
            'animate-rapi-pulse transition-transform hover:scale-105 active:scale-95',
          )}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        {RIGHT_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </div>
  )
}
