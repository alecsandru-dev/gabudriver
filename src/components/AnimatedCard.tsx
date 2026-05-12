'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
  onClick?: () => void
  neon?: 'cyan' | 'pink' | 'lime' | 'orange' | 'blue' | 'purple'
}

export function AnimatedCard({ children, className, delay = 0, onClick, neon }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={clsx('card', neon && `card-${neon}`, className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
