import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  income: 'bg-rapi-income-soft text-rapi-income',
  expense: 'bg-rapi-expense-soft text-rapi-expense',
  savings: 'bg-rapi-savings-soft text-rapi-blue',
  warning: 'bg-rapi-warning-soft text-[#946800]',
} as const

interface RapiBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: keyof typeof VARIANTS
}

export function RapiBadge({ variant, className, ...props }: RapiBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
