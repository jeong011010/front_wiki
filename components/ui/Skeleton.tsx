import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700'
  
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  )
}

// ArticleCard용 Skeleton
export function ArticleCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-start justify-between mb-2 md:mb-3 gap-2">
        <Skeleton variant="text" className="h-5 md:h-6 flex-1" />
        <Skeleton variant="rectangular" className="h-5 w-16" />
      </div>
      <div className="flex-1 mb-3 md:mb-4 space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-3/4" />
      </div>
      <div className="flex items-center justify-between text-xs mt-auto">
        <Skeleton variant="text" className="h-3 w-24" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
  )
}

