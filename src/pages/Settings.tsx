import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Eye, EyeOff, Moon, Plus, Sparkles, Sun, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiButton } from '@/components/rapi/RapiButton'
import { RapiCard } from '@/components/rapi/RapiCard'
import { useT } from '@/lib/i18n'
import { SPRING_POP } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { AI_PROVIDERS, providerMeta, useAiStore } from '@/store/aiStore'
import { useCategoryStore } from '@/store/categoryStore'
import { type Lang, type Theme, useSettingsStore } from '@/store/settingsStore'
import { useUiStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

// Kelas input yang konsisten light & dark
const INPUT =
  'rounded-rapi-md border-[1.5px] border-rapi-blue/20 bg-white/70 outline-none transition-colors focus-within:border-rapi-blue focus:border-rapi-blue dark:border-white/10 dark:bg-white/5'
const SECTION_H = 'mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-rapi-gray-600'

export default function Settings() {
  const t = useT()
  const profile = useUserStore((s) => s.profile)
  const updateName = useUserStore((s) => s.updateName)
  const setInitialBalance = useUserStore((s) => s.setInitialBalance)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const lang = useSettingsStore((s) => s.lang)
  const setLang = useSettingsStore((s) => s.setLang)
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
    showToast(t.settings.catAdded)
  }

  const handleReset = () => {
    if (!confirm(t.settings.resetConfirm)) return
    ;['rapi-user', 'rapi-transactions', 'rapi-categories', 'rapi-investments', 'rapi-ai'].forEach((k) =>
      localStorage.removeItem(k),
    )
    window.location.href = '/'
  }

  const expenseCats = categories.filter((c) => c.type === 'expense')
  const incomeCats = categories.filter((c) => c.type === 'income')

  const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: t.settings.themeLight, icon: Sun },
    { id: 'dark', label: t.settings.themeDark, icon: Moon },
  ]
  const LANGS: { id: Lang; label: string }[] = [
    { id: 'id', label: 'Indonesia 🇮🇩' },
    { id: 'en', label: 'English 🇬🇧' },
  ]

  return (
    <PageWrapper>
      <TopBar title={t.settings.title} />

      {/* Kartu profil */}
      <RapiCard className="animate-rapi-fade-up flex items-center gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rapi-yellow text-xl font-bold text-rapi-navy">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="set-name" className="text-[11px] font-medium text-rapi-gray-600">
            {t.settings.nameLabel}
          </label>
          <input
            id="set-name"
            value={profile?.name ?? ''}
            onChange={(e) => updateName(e.target.value)}
            maxLength={30}
            className="w-full bg-transparent text-base font-bold text-rapi-navy outline-none dark:text-rapi-dark-ink"
          />
        </div>
      </RapiCard>

      {/* Tampilan — Tema & Bahasa */}
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '50ms' }}>
        <h2 className={SECTION_H}>{t.settings.appearance}</h2>
        <RapiCard className="flex flex-col gap-3.5">
          {/* Tema */}
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
              {t.settings.theme}
            </p>
            <div className="flex rounded-rapi-md bg-rapi-gray-100 p-1 dark:bg-white/5">
              {THEMES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  className={cn(
                    'relative flex flex-1 items-center justify-center gap-1.5 rounded-[7px] py-2 text-[12px] font-semibold transition-colors',
                    theme === id
                      ? 'text-rapi-navy dark:text-rapi-dark-ink'
                      : 'text-rapi-gray-600 hover:text-rapi-navy dark:hover:text-rapi-dark-ink',
                  )}
                >
                  {theme === id && (
                    <motion.span
                      layoutId="rapi-theme-thumb"
                      transition={SPRING_POP}
                      aria-hidden
                      className="absolute inset-0 rounded-[7px] bg-white shadow-rapi-card dark:bg-rapi-blue/40"
                    />
                  )}
                  <Icon size={14} className="relative" />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bahasa */}
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
              {t.settings.language}
            </p>
            <div className="flex rounded-rapi-md bg-rapi-gray-100 p-1 dark:bg-white/5">
              {LANGS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLang(id)}
                  className={cn(
                    'relative flex-1 rounded-[7px] py-2 text-[12px] font-semibold transition-colors',
                    lang === id
                      ? 'text-rapi-navy dark:text-rapi-dark-ink'
                      : 'text-rapi-gray-600 hover:text-rapi-navy dark:hover:text-rapi-dark-ink',
                  )}
                >
                  {lang === id && (
                    <motion.span
                      layoutId="rapi-lang-thumb"
                      transition={SPRING_POP}
                      aria-hidden
                      className="absolute inset-0 rounded-[7px] bg-white shadow-rapi-card dark:bg-rapi-blue/40"
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </RapiCard>
      </section>

      {/* Keuangan */}
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '110ms' }}>
        <h2 className={SECTION_H}>{t.settings.finance}</h2>
        <RapiCard>
          <label htmlFor="set-balance" className="text-[13px] font-medium text-rapi-gray-600">
            {t.settings.initialBalance}
          </label>
          <div className={cn('mt-1 flex items-center', INPUT)}>
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
          <p className="mt-1.5 text-[11px] text-rapi-gray-600">{t.settings.balanceHelper}</p>
        </RapiCard>
      </section>

      {/* Rapi AI — BYOK multi-provider */}
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '170ms' }}>
        <h2 className={SECTION_H}>{t.settings.aiSection}</h2>
        <RapiCard>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-rapi-blue" />
            <span className="text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
              {t.settings.aiProvider}
            </span>
            <span
              className={cn(
                'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
                apiKey
                  ? 'bg-rapi-income-soft text-rapi-income dark:bg-rapi-income/20'
                  : 'bg-rapi-gray-100 text-rapi-gray-600 dark:bg-white/10',
              )}
            >
              {apiKey ? t.settings.active : t.settings.inactive}
            </span>
          </div>

          <div className={cn('relative mt-2', INPUT)}>
            <select
              value={aiProvider}
              onChange={(e) => setProvider(e.target.value as typeof aiProvider)}
              aria-label={t.settings.aiProvider}
              className="w-full appearance-none rounded-rapi-md bg-transparent py-2.5 pl-3 pr-9 text-[13px] font-semibold text-rapi-navy outline-none dark:text-rapi-dark-ink [&>option]:text-rapi-navy"
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

          <label htmlFor="ai-key" className="mb-1 mt-3 block text-[12px] font-medium text-rapi-gray-600">
            {t.settings.apiKey}
          </label>
          <div className={cn('flex items-center', INPUT)}>
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
              aria-label={showKey ? t.common.close : 'Show'}
              className="px-3 text-rapi-gray-600"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <label htmlFor="ai-model" className="mb-1 mt-3 block text-[12px] font-medium text-rapi-gray-600">
            {t.settings.model}
          </label>
          <input
            id="ai-model"
            value={aiModel}
            onChange={(e) => setModel(e.target.value)}
            placeholder={providerMeta(aiProvider).defaultModel || 'model-name'}
            autoComplete="off"
            className={cn('w-full px-3 py-2.5 text-[13px] outline-none', INPUT)}
          />

          {providerMeta(aiProvider).needsBaseUrl && (
            <>
              <label htmlFor="ai-url" className="mb-1 mt-3 block text-[12px] font-medium text-rapi-gray-600">
                {t.settings.baseUrl}
              </label>
              <input
                id="ai-url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.provider.com/v1"
                autoComplete="off"
                className={cn('w-full px-3 py-2.5 text-[13px] outline-none', INPUT)}
              />
            </>
          )}

          <p className="mt-2 text-[11px] leading-relaxed text-rapi-gray-600">
            {t.settings.aiHelp}
            {providerMeta(aiProvider).keyUrl && (
              <span className="font-semibold text-rapi-blue">
                {t.settings.aiHelpKey(providerMeta(aiProvider).keyUrl)}
              </span>
            )}
            {t.settings.aiHelpEnd}
          </p>
        </RapiCard>
      </section>

      {/* Kategori — collapsible */}
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '230ms' }}>
        <h2 className={SECTION_H}>{t.settings.categories}</h2>
        <RapiCard className="overflow-hidden p-0">
          <button
            type="button"
            onClick={() => setCatOpen((v) => !v)}
            aria-expanded={catOpen}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <span className="text-[13px] font-semibold text-rapi-navy dark:text-rapi-dark-ink">
              {t.settings.manageCategories}
            </span>
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-rapi-gray-100 px-2 py-0.5 text-[10px] font-semibold text-rapi-gray-600 dark:bg-white/10">
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
                  <div className="flex gap-2">
                    <input
                      value={newCat.emoji}
                      onChange={(e) => setNewCat((c) => ({ ...c, emoji: e.target.value.slice(0, 2) }))}
                      placeholder="🏷️"
                      aria-label="Emoji"
                      className={cn('w-12 py-2.5 text-center text-base outline-none', INPUT)}
                    />
                    <input
                      value={newCat.name}
                      onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
                      placeholder={t.settings.newCatPlaceholder}
                      className={cn('flex-1 px-3 py-2.5 text-[13px] outline-none', INPUT)}
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <div className="flex flex-1 rounded-rapi-md bg-rapi-gray-100 p-1 dark:bg-white/5">
                      {(
                        [
                          { id: 'expense', label: t.common.expense },
                          { id: 'income', label: t.common.income },
                        ] as const
                      ).map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setNewCat((c) => ({ ...c, type: id }))}
                          className={cn(
                            'relative flex-1 rounded-[7px] py-1.5 text-[12px] font-semibold transition-colors',
                            newCat.type === id
                              ? 'text-rapi-navy dark:text-rapi-dark-ink'
                              : 'text-rapi-gray-600 hover:text-rapi-navy dark:hover:text-rapi-dark-ink',
                          )}
                        >
                          {newCat.type === id && (
                            <motion.span
                              layoutId="rapi-cattype-thumb"
                              transition={SPRING_POP}
                              aria-hidden
                              className="absolute inset-0 rounded-[7px] bg-white shadow-rapi-card dark:bg-rapi-blue/40"
                            />
                          )}
                          <span className="relative">{label}</span>
                        </button>
                      ))}
                    </div>
                    <RapiButton variant="blue" size="sm" onClick={handleAddCat} className="px-4">
                      <Plus size={15} />
                      {t.common.add}
                    </RapiButton>
                  </div>

                  {(
                    [
                      { title: t.common.expense, list: expenseCats },
                      { title: t.common.income, list: incomeCats },
                    ] as const
                  ).map(({ title, list }) => (
                    <div key={title} className="mt-3">
                      <p className="mb-1.5 text-[11px] font-medium text-rapi-gray-600">{title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((cat) => (
                          <span
                            key={cat.id}
                            className="inline-flex items-center gap-1 rounded-full bg-rapi-gray-100 py-1 pl-2.5 pr-1 text-[12px] font-medium text-rapi-navy dark:bg-white/10 dark:text-rapi-dark-ink"
                          >
                            <Icon3D name={cat.id} size={15} fallback={cat.emoji} />
                            {cat.name}
                            <button
                              type="button"
                              onClick={() => removeCategory(cat.id)}
                              aria-label={`${t.common.delete} ${cat.name}`}
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
      <section className="animate-rapi-fade-up mt-5" style={{ animationDelay: '290ms' }}>
        <h2 className={SECTION_H}>{t.settings.other}</h2>
        <RapiCard className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-[13px] font-semibold text-rapi-expense"
          >
            <Trash2 size={15} />
            {t.settings.resetData}
          </button>
          <p className="text-[11px] text-rapi-gray-600">{t.settings.version}</p>
        </RapiCard>
      </section>
    </PageWrapper>
  )
}
