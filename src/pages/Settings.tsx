import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Eye, EyeOff, Plus, Sparkles, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { SPRING_POP } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { AI_PROVIDERS, providerMeta, useAiStore } from '@/store/aiStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

export default function Settings() {
  const profile = useUserStore((s) => s.profile)
  const updateName = useUserStore((s) => s.updateName)
  const setInitialBalance = useUserStore((s) => s.setInitialBalance)
  const aiProvider = useAiStore((s) => s.provider)
  const setProvider = useAiStore((s) => s.setProvider)
  const apiKey = useAiStore((s) => s.apiKey)
  const setApiKey = useAiStore((s) => s.setApiKey)
  const aiModel = useAiStore((s) => s.model)
  const setModel = useAiStore((s) => s.setModel)
  const baseUrl = useAiStore((s) => s.baseUrl)
  const setBaseUrl = useAiStore((s) => s.setBaseUrl)
  const categories = useCategoryStore((s) => s.categories)
  const addCategory = useCategoryStore((s) => s.addCategory)
  const removeCategory = useCategoryStore((s) => s.removeCategory)
  const showToast = useUiStore((s) => s.showToast)

  const [showKey, setShowKey] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
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
      <RapiCard className="animate-rapi-fade-up flex items-center gap-3.5">
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
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '70ms' }}>
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

      {/* Rapi AI — BYOK multi-provider */}
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '140ms' }}>
        <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-rapi-gray-600">
          Rapi AI
        </h2>
        <RapiCard>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-rapi-blue" />
            <span className="text-[13px] font-semibold text-rapi-navy">Provider AI</span>
            <span
              className={cn(
                'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
                apiKey ? 'bg-rapi-income-soft text-rapi-income' : 'bg-rapi-gray-100 text-rapi-gray-600',
              )}
            >
              {apiKey ? 'Aktif' : 'Belum diisi'}
            </span>
          </div>

          {/* Pilih provider — dropdown biar hemat tempat */}
          <div className="relative mt-2">
            <select
              value={aiProvider}
              onChange={(e) => setProvider(e.target.value as typeof aiProvider)}
              aria-label="Provider AI"
              className="w-full appearance-none rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 py-2.5 pl-3 pr-9 text-[13px] font-semibold text-rapi-navy outline-none transition-colors focus:border-rapi-blue"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-rapi-gray-600"
            />
          </div>

          {/* API key */}
          <label htmlFor="ai-key" className="mb-1 mt-3 block text-[12px] font-medium text-rapi-gray-600">
            API Key
          </label>
          <div className="flex items-center rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 focus-within:border-rapi-blue">
            <input
              id="ai-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showKey ? 'text' : 'password'}
              placeholder={providerMeta(aiProvider).keyHint}
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

          {/* Model */}
          <label htmlFor="ai-model" className="mb-1 mt-3 block text-[12px] font-medium text-rapi-gray-600">
            Model
          </label>
          <input
            id="ai-model"
            value={aiModel}
            onChange={(e) => setModel(e.target.value)}
            placeholder={providerMeta(aiProvider).defaultModel || 'nama-model'}
            autoComplete="off"
            className="w-full rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 px-3 py-2.5 text-[13px] outline-none focus:border-rapi-blue"
          />

          {/* Base URL — hanya untuk custom / OpenAI-compatible */}
          {providerMeta(aiProvider).needsBaseUrl && (
            <>
              <label htmlFor="ai-url" className="mb-1 mt-3 block text-[12px] font-medium text-rapi-gray-600">
                Base URL
              </label>
              <input
                id="ai-url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.provider.com/v1"
                autoComplete="off"
                className="w-full rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 px-3 py-2.5 text-[13px] outline-none focus:border-rapi-blue"
              />
            </>
          )}

          <p className="mt-2 text-[11px] leading-relaxed text-rapi-gray-600">
            Pakai API key kamu sendiri buat fitur AI (scan struk, chat) — bebas provider.
            Disimpan di HP kamu aja, nggak dikirim ke mana-mana.
            {providerMeta(aiProvider).keyUrl && (
              <>
                {' '}
                Bikin key di{' '}
                <span className="font-semibold text-rapi-blue">
                  {providerMeta(aiProvider).keyUrl}
                </span>
                .
              </>
            )}{' '}
            Tanpa key, parser teks tetap jalan penuh.
          </p>
        </RapiCard>
      </section>

      {/* Kategori — collapsible biar nggak makan tempat */}
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '210ms' }}>
        <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-rapi-gray-600">
          Kategori
        </h2>
        <RapiCard className="overflow-hidden p-0">
          <button
            type="button"
            onClick={() => setCatOpen((v) => !v)}
            aria-expanded={catOpen}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <span className="text-[13px] font-semibold text-rapi-navy">Kelola Kategori</span>
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-rapi-gray-100 px-2 py-0.5 text-[10px] font-semibold text-rapi-gray-600">
                {categories.length}
              </span>
              <ChevronDown
                size={16}
                className={cn('text-rapi-gray-600 transition-transform', catOpen && 'rotate-180')}
              />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {catOpen && (
              <motion.div
                key="cat-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
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
                    'relative flex-1 rounded-[7px] py-1.5 text-[12px] font-semibold transition-colors',
                    newCat.type === id ? 'text-rapi-navy' : 'text-rapi-gray-600 hover:text-rapi-navy',
                  )}
                >
                  {/* Thumb meluncur antar pilihan (aturan state-transition) */}
                  {newCat.type === id && (
                    <motion.span
                      layoutId="rapi-cattype-thumb"
                      transition={SPRING_POP}
                      aria-hidden
                      className="absolute inset-0 rounded-[7px] bg-white shadow-rapi-card"
                    />
                  )}
                  <span className="relative">{label}</span>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </RapiCard>
      </section>

      {/* Lainnya */}
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '280ms' }}>
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
