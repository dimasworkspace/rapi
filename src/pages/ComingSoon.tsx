import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { RapiCard } from '@/components/rapi/RapiCard'

interface ComingSoonProps {
  title: string
  emoji: string
  message: string
  showBack?: boolean
}

/** Placeholder Fase 1 — halaman fitur yang nyusul, tetap on-brand. */
export default function ComingSoon({ title, emoji, message, showBack = false }: ComingSoonProps) {
  return (
    <PageWrapper>
      <TopBar title={title} showBack={showBack} />
      <RapiCard className="mt-6 flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="text-5xl">{emoji}</span>
        <p className="text-sm leading-relaxed text-rapi-gray-600">{message}</p>
      </RapiCard>
    </PageWrapper>
  )
}
