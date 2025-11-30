import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full px-4 py-3 md:py-2.5 bg-surface border rounded-lg',
          'text-text-primary placeholder:text-text-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-all text-base',
          error && 'border-red-400 focus:ring-red-500',
          !error && 'border-border',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input

