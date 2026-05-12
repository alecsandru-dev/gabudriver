'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const PIN_LENGTH = 4
const NEON_CYAN = '#00C8FF'
const NEON_PURPLE = '#B44FFF'
const NEON_PINK = '#FF2A8A'

function CatAvatar() {
  return (
    <motion.div
      style={{ position: 'relative', width: 92, height: 92 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Spinning conic ring */}
      <motion.div
        style={{
          position: 'absolute', inset: -5, borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${NEON_CYAN}, transparent 30%, ${NEON_CYAN}60 60%, transparent 90%, ${NEON_CYAN})`,
          filter: `blur(0.5px) drop-shadow(0 0 14px ${NEON_CYAN}88)`,
          mask: 'radial-gradient(circle, transparent 57%, black 59%, black 71%, transparent 73%)',
          WebkitMask: 'radial-gradient(circle, transparent 57%, black 59%, black 71%, transparent 73%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Pulsing halo */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `1.5px solid ${NEON_CYAN}66`,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
      />
      {/* Face */}
      <div style={{
        position: 'absolute', inset: 5, borderRadius: '50%',
        background: `radial-gradient(circle at 30% 25%, ${NEON_CYAN}30 0%, #0C0C18 70%)`,
        border: `1.5px solid ${NEON_CYAN}88`,
        boxShadow: `0 0 20px ${NEON_CYAN}55, inset 0 1px 0 rgba(255,255,255,0.18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, lineHeight: 1,
      }}>
        😸
      </div>
    </motion.div>
  )
}

function KeypadKey({ children, onClick, ghost }: { children?: React.ReactNode; onClick?: () => void; ghost?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        height: 64, borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.08)',
        borderTopColor: 'rgba(255,255,255,0.18)',
        background: ghost
          ? 'transparent'
          : 'linear-gradient(180deg, rgba(28,28,48,0.7) 0%, rgba(14,14,28,0.85) 100%)',
        color: '#F2F0FF',
        fontFamily: 'Space Grotesk, system-ui',
        fontWeight: 600, fontSize: 26,
        boxShadow: ghost ? 'none' : '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        backdropFilter: ghost ? 'none' : 'blur(10px)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </motion.button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pin.length === PIN_LENGTH) submitPin(pin)
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submitPin(value: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      })
      if (res.ok) { router.push('/'); router.refresh() }
      else {
        setShake(true); setError(true)
        setTimeout(() => { setPin(''); setShake(false); setError(false); setLoading(false) }, 700)
      }
    } catch {
      setShake(true)
      setTimeout(() => { setPin(''); setShake(false); setLoading(false) }, 700)
    }
  }

  function press(digit: string) { if (!loading && pin.length < PIN_LENGTH) setPin((p) => p + digit) }
  function backspace() { if (!loading) setPin((p) => p.slice(0, -1)) }

  const PAD = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['','0','⌫'],
  ]

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px',
      paddingTop: 'max(48px, env(safe-area-inset-top))',
      paddingBottom: 'max(36px, env(safe-area-inset-bottom))',
      background: '#05050C', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
        <motion.div
          style={{ position:'absolute', width:340, height:340, borderRadius:'50%', left:'-25%', top:'-10%',
            filter:'blur(70px)', background:`radial-gradient(circle, ${NEON_CYAN}44 0%, transparent 60%)` }}
          animate={{ scale:[1,1.15,1], opacity:[0.7,1,0.7] }}
          transition={{ duration:5, repeat:Infinity, ease:'easeInOut' }}
        />
        <motion.div
          style={{ position:'absolute', width:300, height:300, borderRadius:'50%', right:'-20%', bottom:'15%',
            filter:'blur(70px)', background:`radial-gradient(circle, ${NEON_PINK}40 0%, transparent 60%)` }}
          animate={{ scale:[1.1,1,1.1] }}
          transition={{ duration:7, repeat:Infinity, ease:'easeInOut', delay:2 }}
        />
        {/* Dot grid */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize:'22px 22px',
        }} />
      </div>

      {/* Brand mark */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, position: 'relative', zIndex: 1 }}
      >
        <CatAvatar />
        <div style={{
          marginTop: 18,
          fontFamily: 'Space Grotesk, system-ui', fontWeight: 700,
          fontSize: 30, letterSpacing: '-0.02em',
          background: `linear-gradient(135deg, ${NEON_CYAN} 0%, ${NEON_PURPLE} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          PisiPilot
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: '#9090A8', letterSpacing: '0.02em' }}>
          Copilotul tău pentru permis
        </div>
      </motion.div>

      {/* PIN dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}
      >
        <motion.div
          animate={shake ? { x: [-12, 12, -9, 9, -5, 5, 0] } : {}}
          transition={{ duration: 0.45 }}
          style={{ display: 'flex', gap: 14 }}
          aria-label={`PIN: ${pin.length} din ${PIN_LENGTH}`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const filled = i < pin.length
            return (
              <motion.div
                key={i}
                animate={filled ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.15 }}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: filled ? (error ? NEON_PINK : NEON_CYAN) : 'transparent',
                  border: `1.5px solid ${filled ? (error ? NEON_PINK : NEON_CYAN) : 'rgba(255,255,255,0.18)'}`,
                  boxShadow: filled ? `0 0 14px ${error ? NEON_PINK : NEON_CYAN}aa` : 'none',
                  transition: 'all 0.18s',
                }}
              />
            )
          })}
        </motion.div>
        <div style={{ fontSize: 12.5, color: error ? NEON_PINK : '#4C4C68', letterSpacing: '0.05em', textAlign: 'center' }}>
          {error ? 'PIN greșit. PisiPilot a clipit suspicios. 🐱' : 'PIN-ul tău secret, fetița mea 🐾'}
        </div>
      </motion.div>

      {/* Keypad */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 320, position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {PAD.map((row, ri) =>
            row.map((key, ki) => {
              if (!key) return <div key={`${ri}-${ki}`} />
              const isBack = key === '⌫'
              return (
                <KeypadKey
                  key={`${ri}-${ki}`}
                  ghost={isBack}
                  onClick={() => isBack ? backspace() : press(key)}
                >
                  {isBack ? (
                    <svg width="22" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M7 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7l-6-8 6-8Z"
                        stroke="#9090A8" strokeWidth="1.7" strokeLinejoin="round" />
                      <path d="M11 9l5 6m0-6l-5 6" stroke="#9090A8" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  ) : key}
                </KeypadKey>
              )
            })
          )}
        </div>
      </motion.div>
    </div>
  )
}
