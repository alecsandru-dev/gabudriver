'use client'
import { motion } from 'framer-motion'
import { Badge } from '@/lib/badges'
import { clsx } from 'clsx'

interface Props {
  badge: Badge
  unlocked: boolean
  isNew?: boolean
  delay?: number
}

// Map badge color strings to neon glow
function getBadgeGlow(color: string): string {
  if (color.includes('orange') || color.includes('red'))   return 'rgba(255,107,26,0.4)'
  if (color.includes('blue')  || color.includes('cyan'))   return 'rgba(0,200,255,0.4)'
  if (color.includes('violet')|| color.includes('purple')) return 'rgba(180,79,255,0.4)'
  if (color.includes('emerald')|| color.includes('teal'))  return 'rgba(168,255,30,0.35)'
  if (color.includes('pink')  || color.includes('rose'))   return 'rgba(255,42,138,0.4)'
  if (color.includes('amber') || color.includes('yellow')) return 'rgba(255,215,0,0.4)'
  return 'rgba(0,200,255,0.3)'
}

export function BadgeCard({ badge, unlocked, isNew = false, delay = 0 }: Props) {
  const glow = getBadgeGlow(badge.color)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, type: 'spring', stiffness: 260, damping: 22 }}
      className="card p-4 flex flex-col items-center gap-2 text-center relative overflow-hidden"
      style={unlocked ? {
        border: `1px solid ${glow.replace('0.4', '0.35')}`,
        boxShadow: `var(--glass-shadow), 0 0 20px ${glow.replace('0.4', '0.12')}`,
      } : {
        opacity: 0.3,
      }}
    >
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="absolute top-1.5 right-1.5 text-white text-[9px] font-display font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: 'linear-gradient(135deg,#FF2A8A,#B44FFF)' }}
        >
          NOU
        </motion.div>
      )}

      {/* Badge icon */}
      <div
        className="relative"
        style={unlocked ? {
          filter: `drop-shadow(0 0 10px ${glow})`,
        } : {}}
      >
        <div
          className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center text-2xl', unlocked ? `bg-gradient-to-br ${badge.color}` : 'bg-white/[0.04]')}
          style={unlocked ? { boxShadow: `0 4px 16px ${glow}` } : {}}
        >
          {unlocked ? badge.emoji : '🔒'}
        </div>
      </div>

      <div>
        <p className="text-xs font-display font-bold leading-tight" style={{ color: unlocked ? '#F2F0FF' : '#4C4C68' }}>
          {badge.name}
        </p>
        <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#4C4C68' }}>
          {unlocked ? badge.description : badge.hint}
        </p>
      </div>
    </motion.div>
  )
}
