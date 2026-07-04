import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  primary: 'bg-rapi-navy text-white',
  accent: 'bg-rapi-yellow text-rapi-navy',
  blue: 'bg-rapi-blue text-white',
  outline: 'border-2 border-rapi-navy bg-transparent text-rapi-navy',
  ghost: 'bg-rapi-gray-100 text-rapi-navy',
} as const

const SIZES = {
  md: 'min-h-11 rounded-rapi-md px-5 py-3 text-sm',
  sm: 'min-h-10 rounded-rapi-sm px-4 py-2 text-xs',
} as const

interface RapiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
}

export function RapiButton({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: RapiButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold transition-all',
        'hover:-translate-y-px active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
}
