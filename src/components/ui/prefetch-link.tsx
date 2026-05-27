'use client'

import Link, { type LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

type PrefetchLinkProps = LinkProps & {
  className?: string
  children: React.ReactNode
}

/**
 * Link that **also** runs `router.prefetch` on pointer enter / touch start.
 * Next.js prefetches on viewport entry; this kicks it earlier when the user
 * intent is clear, shrinking the visible transition gap on mobile and
 * touch-first UIs.
 */
export function PrefetchLink({
  href,
  className,
  children,
  prefetch,
  ...rest
}: PrefetchLinkProps) {
  const router = useRouter()
  const triggered = useRef(false)

  const trigger = useCallback(() => {
    if (triggered.current) return
    triggered.current = true
    if (typeof href === 'string') router.prefetch(href)
  }, [href, router])

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onPointerEnter={trigger}
      onTouchStart={trigger}
      onFocus={trigger}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  )
}
