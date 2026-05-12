'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Gamepad2, Wind, Trophy, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { href: '/',       label: 'Acasă',    Icon: Home },
  { href: '/jocuri', label: 'Jocuri',   Icon: Gamepad2 },
  { href: '/calm',   label: 'Calm',     Icon: Wind },
  { href: '/badges', label: 'Badge-uri',Icon: Trophy },
  { href: '/setari', label: 'Setări',   Icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <nav
        className="flex items-center justify-around w-full max-w-sm"
        style={{
          margin: '0 16px',
          padding: '6px 8px',
          background: 'rgba(6,6,16,0.9)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '999px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-full tap-target transition-all"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              style={isActive ? {
                background: 'rgba(0,200,255,0.1)',
                boxShadow: 'inset 0 0 0 1px rgba(0,200,255,0.2)',
              } : {}}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(0,200,255,0.07)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <Icon
                className="relative z-10 transition-all duration-200"
                style={{
                  width: 18, height: 18,
                  color: isActive ? '#00C8FF' : '#4C4C68',
                  strokeWidth: isActive ? 2.5 : 1.8,
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(0,200,255,0.7))' : 'none',
                }}
              />
              <span
                className="relative z-10 font-medium transition-all duration-200"
                style={{
                  fontSize: 9,
                  color: isActive ? '#00C8FF' : '#4C4C68',
                  textShadow: isActive ? '0 0 8px rgba(0,200,255,0.6)' : 'none',
                  letterSpacing: '0.04em',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
