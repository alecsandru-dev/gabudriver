'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

// SVG icons matching pisi-shared.jsx IconHome / IconGames / IconLeaf / IconTrophy / IconSettings
function IconHome({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      style={{ filter: glow ? `drop-shadow(0 0 6px ${color})` : 'none' }}>
      <path d="M4 11.5L12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-3.25v-5.75h-6.5V20.5H5.5A1.5 1.5 0 0 1 4 19v-7.5Z"
        stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}
function IconGames({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      style={{ filter: glow ? `drop-shadow(0 0 6px ${color})` : 'none' }}>
      <rect x="3" y="7" width="18" height="11" rx="3.5" stroke={color} strokeWidth="1.7" />
      <path d="M7.5 11.5v3M6 13h3M14 12.5h.01M16.5 14h.01" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IconLeaf({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      style={{ filter: glow ? `drop-shadow(0 0 6px ${color})` : 'none' }}>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M5 19c4-4 8-6 13-7" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IconTrophy({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      style={{ filter: glow ? `drop-shadow(0 0 6px ${color})` : 'none' }}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M5 5h3v3a2.5 2.5 0 0 1-3-2.5V5ZM19 5h-3v3a2.5 2.5 0 0 0 3-2.5V5Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10 14h4v4H10zM8 19h8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IconSettings({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.7" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

const CYAN = '#00C8FF'
const MUTE = '#4C4C68'

const NAV_ITEMS = [
  { href: '/',       label: 'Acasă',   Icon: IconHome   },
  { href: '/jocuri', label: 'Jocuri',  Icon: IconGames  },
  { href: '/calm',   label: 'Calm',    Icon: IconLeaf   },
  { href: '/badges', label: 'Insigne', Icon: IconTrophy },
  { href: '/setari', label: 'Setări',  Icon: IconSettings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
    >
      <nav
        className="flex items-center justify-around"
        style={{
          margin: '0 12px',
          width: 'calc(100% - 24px)',
          maxWidth: 420,
          padding: '8px 10px',
          borderRadius: 28,
          background: 'rgba(10,10,22,0.78)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderTopColor: 'rgba(255,255,255,0.18)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6), 0 0 24px rgba(0,200,255,0.08), inset 0 1px 0 rgba(255,255,255,0.10)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const color = isActive ? CYAN : MUTE
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 10px', borderRadius: 18,
                minWidth: 48, minHeight: 48,
                background: isActive ? 'rgba(0,200,255,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(0,200,255,0.35)' : '1px solid transparent',
                boxShadow: isActive ? `0 0 16px rgba(0,200,255,0.2), inset 0 1px 0 rgba(0,200,255,0.2)` : 'none',
                transition: 'background 0.2s, border-color 0.2s',
                textDecoration: 'none',
              }}
            >
              <Icon color={color} glow={isActive} />
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                color,
                textShadow: isActive ? `0 0 8px ${CYAN}88` : 'none',
                fontFamily: 'Space Grotesk, system-ui',
              }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
