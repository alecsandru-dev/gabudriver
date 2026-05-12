'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: 'orange' | 'cyan' | 'pink' | 'lime' | 'blue' | 'purple' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const V: Record<string, { cls: string; text: string }> = {
  orange:  { cls: 'btn-orange', text: 'text-white' },
  cyan:    { cls: 'btn-cyan',   text: 'text-white' },
  pink:    { cls: 'btn-pink',   text: 'text-white' },
  lime:    { cls: 'btn-lime',   text: 'text-[#0a1200] font-black' },
  blue:    { cls: 'btn-blue',   text: 'text-white' },
  purple:  { cls: 'btn-purple', text: 'text-white' },
  ghost:   { cls: 'btn-ghost',  text: 'text-pisi-muted' },
  danger:  { cls: '',           text: 'text-white', },
}

const S = {
  sm: 'py-2.5 px-4 text-sm rounded-xl',
  md: 'py-3.5 px-6 text-sm rounded-2xl',
  lg: 'py-4   px-8 text-base rounded-2xl',
}

export function PrimaryButton({
  children, onClick, disabled, className, variant = 'orange', size = 'md', fullWidth = false, type = 'button',
}: Props) {
  const v = V[variant] ?? V.orange
  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'tap-target select-none font-display font-semibold transition-opacity active:opacity-90',
        v.cls,
        v.text,
        S[size],
        fullWidth && 'w-full',
        variant === 'danger' && 'bg-gradient-to-r from-red-600 to-red-500 shadow-neon-pink',
        disabled && 'opacity-30 pointer-events-none',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
