'use client'
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props {
  children: ReactNode
  className?: string
}

export function SafeAreaContainer({ children, className }: Props) {
  return (
    <div
      className={clsx(
        'min-h-screen-safe w-full max-w-md mx-auto relative',
        className
      )}
    >
      {children}
    </div>
  )
}
