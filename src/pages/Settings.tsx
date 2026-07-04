import { useState } from 'react'
import { Eye, EyeOff, Plus, Sparkles, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { cn } from '@/lib/utils'
import { useAiStore } from '@/store/aiStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

export default function Settings() {
  const profile = useUserStore((s) => s.profile)
  const updateName = useUserStore((s) => s.updateName)
  const setInitialBalance = useUserStore((s) => s.setInitialBalance)
  const apiKey = useAiStore((s) => s.apiKey)
  const setApiKey = useAiStore((s) => s.setApiKey)
  const categories = useCategoryStore((s) => s.categories)
  const addCategory = useCategoryStore((s) => s.addCategory)
  const removeCategory = useCategoryStore((s) => s.removeCategory)
  const showToast = useUiStore((s) => s.showToast)

  const [showKey, setShowKey] = useState(false)
  const [newCat, setNewCat] = useState({ emoji: '', name: '', type: 'expense' as 'expense' | 'income' })

  const name = profile?.name ?? 'Kamu'

  // Bind langsung ke store biar selalu sinkron (hindari isu hydrate).
  const balanceInput = profile?.initialBalance
    ? new Intl.NumberFormat('id-ID').format(profile.initialBalance)
    : ''
  const handleBalance = (v: string) => {
    const d = v.replace(/\D/g, '')
    setInitialBalance(d ? parseInt(d, 10) : 0)
  }

  const handleAddCat = () => {
    if (!newCat.name.trim()) return
    addCategory({ name: newCat.name.trim(), emoji: newCat.emoji.trim() || '🏷️', type: newCat.type })
    setNewCat({ emoji: '', name: '', type: newCat.type })
    showToast('Kategori baru kecatet 🎉')
  }

  const handleReset = () => {
    if (!confirm('Hapus SEMUA data (transaksi, aset, kategori, profil)? Ini nggak bisa dibalikin.')) return
    ;['rapi-user', 'rapi-transactions', 'rapi-categories', 'rapi-investments', 'rapi-ai'].forEach((k) =>
      localStorage.removeItem(k),
    )
    window.location.href = '/'
  }

  const expenseCats = categories.filter((c) => c.type === 'expense')
  const incomeCats = categories.filter((c) => c.type === 'income')

  return (
    <PageWrapper>
      <TopBar title="Profil" />

      {/* Kartu profil */}
      <RapiCard className="flex items-center gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rapi-yellow text-xl font-bold text-rapi-navy">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="set-name" className="text-[11px] font-medium text-rapi-gray-600">
            Nama panggilan
          </label>
          <input
            id="set-name"
            value={profile?.name ?? ''}
            onChange={(e) => updateName(e.target.value)}
            maxLength={30}
            className="w-full bg-transparent text-base font-bold text-rapi-navy outline-none"
          />
        </div>
      </RapiCard>

      {/* Keuangan */}
      <section className="mt-5">
        <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-rapi-gray-600">
          Keuangan
        </h2>
        <RapiCard>
          <label htmlFor="set-balance" className="text-[13px] font-medium text-rapi-gray-600">
            Saldo awal
          </label>
          <div className="mt-1 flex items-center rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 focus-within:border-rapi-blue">
            <span className="pl-3 text-[13px] font-semibold text-rapi-gray-600">Rp</span>
            <input
              id="set-balance"
              value={balanceInput}
              onChange={(e) => handleBalance(e.target.value)}
              placeholder="0"
              inputMode="numeric"
              className="w-full bg-transparent px-2 py-2.5 text-[13px] font-semibold outline-none"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-rapi-gray-600">
            Jadi patokan Total Saldo. Saldo = saldo awal + pemasukan − pengeluaran.
          </p>
        </RapiCard>
      </section>

      {/* Rapi AI — BYOK */}
      <section className="mt-5">
        <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-rapi-gray-600">
          Rapi AI
        </h2>
        <RapiCard>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-rapi-blue" />
            <span className="text-[13px] font-semibold text-rapi-navy">Anthropic API Key</span>
            <span
              className={cn(
                'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
                apiKey ? 'bg-rapi-income-soft text-rapi-income' : 'bg-rapi-gray-100 text-rapi-gray-600',
              )}
            >
              {apiKey ? 'Aktif' : 'Belum diisi'}
            </span>
          </div>
          <div className="mt-2 flex items-center rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 focus-within:border-rapi-blue">
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showKey ? 'text' : 'password'}
              placeholder="sk-ant-..."
              autoComplete="off"
              className="w-full bg-transparent px-3 py-2.5 text-[13px] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? 'Sembunyikan' : 'Tampilkan'}
              className="px-3 text-rapi-gray-600"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-rapi-gray-600">
            Pakai API key kamu sendiri buat fitur AI (scan struk, chat). Disimpan di HP kamu aja,
            nggak dikirim ke mana-mana. Bikin key di{' '}
            <span className="font-semibold text-rapi-blue">console.anthropic.com</span>. Tanpa key,
            parser teks tetap jalan penuh.
          </p>
        </RapiCard>
      </section>

      {/* Kategori */}
      <section className="mt-5">
        <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-rapi-gray-600">
          Kategori
        </h2>
        <RapiCard>
          {/* Tambah kategori */}
          <div className="flex gap-2">
            <input
              value={newCat.emoji}
              onChange={(e) => setNewCat((c) => ({ ...c, emoji: e.target.value.slice(0, 2) }))}
              placeholder="🏷️"
              aria-label="Emoji kategori"
              className="w-12 rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 py-2.5 text-center text-base outline-none focus:border-rapi-blue"
            />
            <input
              value={newCat.name}
              onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
              placeholder="Nama kategori baru"
              className="flex-1 rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 px-3 py-2.5 text-[13px] outline-none focus:border-rapi-blue"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <div className="flex flex-1 rounded-rapi-md bg-rapi-gray-100 p-1">
              {(
                [
                  { id: 'expense', label: 'Pengeluaran' },
                  { id: 'income', label: 'Pemasukan' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setNewCat((c) => ({ ...c, type: id }))}
                  className={cn(
                    'flex-1 rounded-[7px] py-1.5 text-[12px] font-semibold transition-colors',
                    newCat.type === id ? 'bg-white text-rapi-navy shadow-rapi-card' : 'text-rapi-gray-600',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <RapiButton variant="blue" size="sm" onClick={handleAddCat} className="px-4">
              <Plus size={15} />
              Tambah
            </RapiButton>
          </div>

          {/* Daftar kategori */}
          {(
            [
              { title: 'Pengeluaran', list: expenseCats },
              { title: 'Pemasukan', list: incomeCats },
            ] as const
          ).map(({ title, list }) => (
            <div key={title} className="mt-3">
              <p className="mb-1.5 text-[11px] font-medium text-rapi-gray-600">{title}</p>
              <div className="flex flex-wrap gap-1.5">
                {list.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 rounded-full bg-rapi-gray-100 py-1 pl-2.5 pr-1 text-[12px] font-medium text-rapi-navy"
                  >
                    <Icon3D name={cat.id} size={15} fallback={cat.emoji} />
                    {cat.name}
                    <button
                      type="button"
                      onClick={() => removeCategory(cat.id)}
                      aria-label={`Hapus ${cat.name}`}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-rapi-gray-600 transition-colors hover:bg-rapi-expense-soft hover:text-rapi-expense"
                    >
                      <Trash2 size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </RapiCard>
      </section>

      {/* Lainnya */}
      <section className="mt-5">
        <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-rapi-gray-600">
          Lainnya
        </h2>
        <RapiCard className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-[13px] font-semibold text-rapi-expense"
          >
            <Trash2 size={15} />
            Reset semua data
          </button>
          <p className="text-[11px] text-rapi-gray-600">
            Rapi v0.1.0 · Dibuat dengan 💛 buat #RapiinAja
          </p>
        </RapiCard>
      </section>
    </PageWrapper>
  )
}
