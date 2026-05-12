'use client'
import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface Props { children: ReactNode }

export function AppShell({ children }: Props) {
  return (
    <div className="relative min-h-screen-safe overflow-x-hidden">
      {/* ── Animated background orbs ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {/* Cyan top-left */}
        <div
          className="absolute animate-orb-drift-1"
          style={{
            top: '-10%', left: '-15%',
            width: '75vw', height: '75vw',
            background: 'radial-gradient(circle, rgba(0,200,255,0.13) 0%, transparent 65%)',
            filter: 'blur(55px)',
            willChange: 'transform',
          }}
        />
        {/* Pink bottom-right */}
        <div
          className="absolute animate-orb-drift-2"
          style={{
            bottom: '5%', right: '-15%',
            width: '65vw', height: '65vw',
            background: 'radial-gradient(circle, rgba(255,42,138,0.11) 0%, transparent 65%)',
            filter: 'blur(65px)',
            willChange: 'transform',
          }}
        />
        {/* Purple middle */}
        <div
          className="absolute animate-orb-drift-3"
          style={{
            top: '35%', left: '15%',
            width: '55vw', height: '55vw',
            background: 'radial-gradient(circle, rgba(180,79,255,0.07) 0%, transparent 65%)',
            filter: 'blur(60px)',
            willChange: 'transform',
          }}
        />
        {/* Lime accent — subtle */}
        <div
          className="absolute"
          style={{
            top: '60%', right: '5%',
            width: '35vw', height: '35vw',
            background: 'radial-gradient(circle, rgba(168,255,30,0.05) 0%, transparent 65%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div
        className="relative z-10 max-w-md mx-auto pb-nav"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
        {children}
      </div>

      <BottomNav />
    </div>
  )
}
