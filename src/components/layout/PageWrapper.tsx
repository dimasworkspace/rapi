import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

/** Pembungkus konten halaman — padding standar, mobile-first. */
export function PageWrapper({ children, className }: PageWrapperProps) {
  return <main className={cn('px-5 pb-8', className)}>{children}</main>
}
