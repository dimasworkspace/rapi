import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { Icon3D } from '@/components/rapi/Icon3D'
import { RapiCard } from '@/components/rapi/RapiCard'

interface ComingSoonProps {
  title: string
  emoji: string
  message: string
  /** Nama icon 3D (Icon3D); fallback ke emoji. */
  icon?: string
  showBack?: boolean
}

/** Placeholder — halaman fitur yang nyusul, tetap on-brand. */
export default function ComingSoon({
  title,
  emoji,
  message,
  icon = '',
  showBack = false,
}: ComingSoonProps) {
  return (
    <PageWrapper>
      <TopBar title={title} showBack={showBack} />
      <RapiCard className="mt-6 flex flex-col items-center gap-4 px-6 py-12 text-center">
        <Icon3D name={icon} size={60} fallback={emoji} />
        <p className="text-sm leading-relaxed text-rapi-gray-600">{message}</p>
      </RapiCard>
    </PageWrapper>
  )
}
