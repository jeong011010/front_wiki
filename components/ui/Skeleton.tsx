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

// ArticleCard용 Skeleton - ArticleCard와 정확히 같은 구조
export function ArticleCardSkeleton() {
  return (
    <div 
      className="bg-surface border border-border rounded-xl p-3 sm:p-4 md:p-5"
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        contain: 'layout style',
        minHeight: '160px',
        height: '100%',
      }}
    >
      <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-1.5 sm:gap-2">
        <Skeleton variant="text" className="h-4 sm:h-5 md:h-6 flex-1" />
        <Skeleton variant="rectangular" className="h-4 sm:h-5 w-12 sm:w-16 flex-shrink-0 rounded" />
      </div>
      <div className="flex-1 mb-1.5 sm:mb-2 space-y-1.5">
        <Skeleton variant="text" className="h-3 sm:h-4 w-full" />
        <Skeleton variant="text" className="h-3 sm:h-4 w-5/6" />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 sm:gap-1 mt-auto">
        <Skeleton variant="text" className="h-3 w-20 sm:w-24" />
        <Skeleton variant="text" className="h-3 w-12 sm:w-16" />
      </div>
    </div>
  )
}

