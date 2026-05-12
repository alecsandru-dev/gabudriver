'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const PIN_LENGTH = 4

export default function LoginPage() {
  const router = useRouter()
  const [pin, setPin]         = useState('')
  const [shake, setShake]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      submitPin(pin)
    }
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submitPin(value: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        // Wrong PIN — shake and reset
        setShake(true)
        setError(true)
        setTimeout(() => {
          setPin('')
          setShake(false)
          setError(false)
          setLoading(false)
        }, 700)
      }
    } catch {
      setShake(true)
      setTimeout(() => { setPin(''); setShake(false); setLoading(false) }, 700)
    }
  }

  function press(digit: string) {
    if (loading) return
    if (pin.length < PIN_LENGTH) {
      setPin((p) => p + digit)
    }
  }

  function backspace() {
    if (loading) return
    setPin((p) => p.slice(0, -1))
  }

  const PAD = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ]

  return (
    <div
      className="min-h-screen-safe flex flex-col items-center justify-between px-6 relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{ top: '-20%', left: '-20%', width: '80vw', height: '80vw', background: 'radial-gradient(circle, #00C8FF, transparent 65%)', filter: 'blur(50px)' }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute rounded-full"
          style={{ bottom: '-20%', right: '-15%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, #FF2A8A, transparent 65%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mt-12 relative z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative inline-block"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              margin: '-6px',
              background: 'conic-gradient(from 0deg, #00C8FF, #B44FFF, #FF2A8A, #FF6B1A, #00C8FF)',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
              opacity: 0.7,
            }}
          />
          <span className="text-6xl select-none" role="img" aria-label="PisiPilot">🐱</span>
        </motion.div>

        <h1
          className="font-display text-3xl font-bold mt-3 mb-1"
          style={{ background: 'linear-gradient(135deg,#00C8FF 0%,#B44FFF 50%,#FF2A8A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          PisiPilot
        </h1>
        <p className="text-sm" style={{ color: '#9090A8' }}>Bună, Gabu! Introdu PIN-ul.</p>
      </motion.div>

      {/* PIN dots */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-5"
          aria-label={`PIN: ${pin.length} din ${PIN_LENGTH} cifre introduse`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const filled = i < pin.length
            return (
              <motion.div
                key={i}
                animate={filled ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.15 }}
                className="w-5 h-5 rounded-full"
                style={{
                  background: error && filled
                    ? '#FF2A8A'
                    : filled
                    ? '#00C8FF'
                    : 'rgba(255,255,255,0.12)',
                  boxShadow: filled
                    ? error
                      ? '0 0 12px rgba(255,42,138,0.8)'
                      : '0 0 14px rgba(0,200,255,0.8)'
                    : 'none',
                  border: filled ? 'none' : '2px solid rgba(255,255,255,0.2)',
                }}
              />
            )
          })}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs mt-3"
            style={{ color: '#FF2A8A' }}
          >
            PIN greșit. PisiPilot a clipit suspicios. 🐱
          </motion.p>
        )}
      </motion.div>

      {/* Number pad */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xs"
      >
        <div className="grid grid-cols-3 gap-3">
          {PAD.map((row, ri) =>
            row.map((key, ki) => {
              if (!key) return <div key={`${ri}-${ki}`} />

              const isBackspace = key === '⌫'
              return (
                <motion.button
                  key={`${ri}-${ki}`}
                  whileTap={{ scale: 0.90 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onClick={() => isBackspace ? backspace() : press(key)}
                  disabled={loading}
                  aria-label={isBackspace ? 'Sterge' : key}
                  className="flex items-center justify-center rounded-2xl tap-target select-none disabled:opacity-40"
                  style={{
                    height: 68,
                    background: isBackspace
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.07)',
                    border: isBackspace
                      ? '1px solid rgba(255,255,255,0.06)'
                      : '1px solid rgba(255,255,255,0.1)',
                    borderTopColor: isBackspace
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(255,255,255,0.18)',
                    boxShadow: isBackspace
                      ? 'none'
                      : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {isBackspace ? (
                    <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
                      <path d="M8 1L1 8.5L8 16H21V1H8Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
                      <path d="M14 5.5L18 11M18 5.5L14 11" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <span
                      className="font-display font-semibold"
                      style={{ fontSize: 26, color: '#F2F0FF', letterSpacing: '-0.02em' }}
                    >
                      {key}
                    </span>
                  )}
                </motion.button>
              )
            })
          )}
        </div>
      </motion.div>
    </div>
  )
}
