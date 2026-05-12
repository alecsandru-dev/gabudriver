'use client'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface Props {
  label: string
  value: string | number
  icon?: string
  neon?: 'cyan' | 'orange' | 'lime' | 'purple' | 'pink' | 'blue'
  delay?: number
  className?: string
}

const NEON_COLORS: Record<string, string> = {
  cyan:   '#00C8FF',
  orange: '#FF6B1A',
  lime:   '#A8FF1E',
  purple: '#B44FFF',
  pink:   '#FF2A8A',
  blue:   '#4B7FFF',
}

export function StatCard({ label, value, icon, neon = 'cyan', delay = 0, className }: Props) {
  const color = NEON_COLORS[neon]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={clsx('card p-4 flex flex-col gap-1', className)}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#4C4C68' }}>{label}</span>
        {icon && <span className="text-sm">{icon}</span>}
      </div>
      <div
        className="text-xl font-display font-bold"
        style={{ color, textShadow: `0 0 16px ${color}80` }}
      >
        {value}
      </div>
    </motion.div>
  )
}
