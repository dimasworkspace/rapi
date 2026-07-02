import { Home, PieChart, Bot, User, Plus } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/laporan', label: 'Laporan', icon: PieChart },
  { to: '/ai', label: 'Rapi AI', icon: Bot },
  { to: '/profil', label: 'Profil', icon: User },
]

/** Bottom nav 4 tab (active pill Blue) + FAB Blue berdenyut, sesuai UI kit. */
export function BottomNav() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2">
      <div className="relative">
        <button
          type="button"
          onClick={() => navigate('/tambah')}
          aria-label="Tambah transaksi"
          className={cn(
            'absolute -top-7 right-5 flex h-14 w-14 items-center justify-center',
            'rounded-full border-[3px] border-rapi-offwhite bg-rapi-blue text-white',
            'animate-rapi-pulse transition-transform hover:scale-105 active:scale-95',
          )}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        <nav className="flex justify-around border-t border-rapi-gray-300 bg-white px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 rounded-rapi-md px-3 py-1 text-[10px] font-bold transition-all',
                  isActive
                    ? 'bg-rapi-blue/10 text-rapi-blue'
                    : 'text-rapi-gray-600 hover:bg-rapi-gray-100',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={cn('transition-transform', isActive && 'scale-110')} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
