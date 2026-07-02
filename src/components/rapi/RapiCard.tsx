import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface RapiCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'navy' | 'blue'
}

/** Card standar Rapi — putih default, navy untuk highlight, blue untuk CTA/insight AI. */
export function RapiCard({ variant = 'default', className, ...props }: RapiCardProps) {
  return (
    <div
      className={cn(
        'rounded-rapi-lg p-4 shadow-rapi-card transition-all hover:shadow-rapi-elevated',
        variant === 'default' && 'bg-white text-rapi-navy',
        variant === 'navy' && 'bg-rapi-navy text-white',
        variant === 'blue' && 'bg-gradient-to-br from-rapi-blue to-[#0334A0] text-white',
        className,
      )}
      {...props}
    />
  )
}
