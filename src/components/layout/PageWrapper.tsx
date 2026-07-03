import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: ReactNode
  className?: string
  /** Animasi fade-up saat halaman masuk. Matikan kalau halaman punya animasi sendiri. */
  animate?: boolean
}

/** Pembungkus konten halaman — padding standar, mobile-first. */
export function PageWrapper({ children, className, animate = true }: PageWrapperProps) {
  return (
    <main className={cn(animate && 'animate-rapi-fade-up', 'px-5 pb-8', className)}>{children}</main>
  )
}
