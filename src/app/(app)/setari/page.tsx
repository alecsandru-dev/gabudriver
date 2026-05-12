'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { PrimaryButton } from '@/components/PrimaryButton'
import { GlassCard } from '@/components/GlassCard'
import { resetState, clearPraiseHistory } from '@/lib/storage'

const GOLD   = '#FFD700'
const ORANGE = '#FF6B1A'
const PINK   = '#FF2A8A'
const INK    = '#F2F0FF'
const FADE   = '#4C4C68'

export default function SetariPage() {
  const router = useRouter()
  const [confirmReset,  setConfirmReset]  = useState(false)
  const [confirmPraise, setConfirmPraise] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  function handleResetProgress() {
    if (!confirmReset) { setConfirmReset(true); return }
    resetState()
    setDone('Progresul a fost resetat. PisiPilot e trist, dar înțelege.')
    setConfirmReset(false)
  }

  function handleClearPraise() {
    if (!confirmPraise) { setConfirmPraise(true); return }
    clearPraiseHistory()
    setDone('Laudele au fost șterse. Amintirile rămân în inimă.')
    setConfirmPraise(false)
  }

  return (
    <div style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ padding:'2px 2px 0' }}>
        <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:22, color:INK }}>Setări ⚙️</div>
        <div style={{ fontSize:12, color:FADE, marginTop:1 }}>Aplicație și progres</div>
      </motion.div>

      <PisiPilotBubble message="Totul e în ordine, Gabu. Dacă resetezi, o luăm de la zero împreună." mood="calm" />

      {done && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          style={{ padding:'12px 16px', borderRadius:16,
            background:'rgba(168,255,30,0.08)', border:'1px solid rgba(168,255,30,0.3)' }}>
          <div style={{ fontSize:13, color:'#A8FF1E' }}>✓ {done}</div>
        </motion.div>
      )}

      {/* App info */}
      <GlassCard accent="#00C8FF" padding={20} style={{ borderRadius:22 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
          <div style={{
            width:52, height:52, borderRadius:18, flexShrink:0,
            background:'linear-gradient(135deg,#007ACC,#00C8FF)',
            boxShadow:'0 4px 16px rgba(0,200,255,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
          }}>🐱</div>
          <div>
            <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:16, color:INK }}>PisiPilot</div>
            <div style={{ fontSize:11.5, marginTop:2 }}>
              <span style={{ color:'#00C8FF', fontWeight:700, fontFamily:'Space Grotesk,system-ui', textShadow:'0 0 6px #00C8FF88' }}>v1.3</span>
              <span style={{ color:FADE }}> · Copilotul pufos al lui Gabu 🐾</span>
            </div>
          </div>
        </div>
        <div style={{
          padding:'10px 12px', borderRadius:12, fontSize:12, color:'#9090A8', lineHeight:1.6,
          background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
        }}>
          PisiPilot este o aplicație de relaxare și antrenament informal.{' '}
          <strong style={{ color:INK }}>Nu înlocuiește</strong> școala de șoferi,
          legislația oficială sau evaluarea psihologică autorizată.
        </div>
      </GlassCard>

      {/* Actions */}
      <GlassCard padding={16} style={{ borderRadius:22 }}>
        <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:14, color:INK, marginBottom:12 }}>
          Acțiuni
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={handleClearPraise}
            style={{
              width:'100%', textAlign:'left', padding:'14px 16px', borderRadius:16, cursor:'pointer',
              background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.2)',
            }}>
            <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:600, fontSize:13.5, color:GOLD }}>
              {confirmPraise ? '⚠️ Confirmi ștergerea laudelor?' : '🗑️ Șterge peretele de laude'}
            </div>
            <div style={{ fontSize:11, color:FADE, marginTop:2 }}>
              {confirmPraise ? 'Apasă din nou pentru confirmare' : 'Laudele rămân în suflet oricum'}
            </div>
          </button>

          <button onClick={handleResetProgress}
            style={{
              width:'100%', textAlign:'left', padding:'14px 16px', borderRadius:16, cursor:'pointer',
              background:'rgba(255,42,138,0.08)', border:'1px solid rgba(255,42,138,0.2)',
            }}>
            <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:600, fontSize:13.5, color:PINK }}>
              {confirmReset ? '⚠️ Ești sigură? Resetează totul?' : '🔄 Resetează progresul'}
            </div>
            <div style={{ fontSize:11, color:FADE, marginTop:2 }}>
              {confirmReset ? 'Apasă din nou pentru confirmare' : 'XP, badge-uri, statistici — totul'}
            </div>
          </button>

          {(confirmReset || confirmPraise) && (
            <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }}
              onClick={() => { setConfirmReset(false); setConfirmPraise(false) }}
              style={{
                width:'100%', padding:'12px', borderRadius:16, cursor:'pointer',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                color:FADE, fontSize:13, fontFamily:'Space Grotesk,system-ui',
              }}>
              ✕ Anulează
            </motion.button>
          )}
        </div>
      </GlassCard>

      {/* Logout */}
      <PrimaryButton onClick={handleLogout} fullWidth variant="danger">
        🚪 Delogare
      </PrimaryButton>
      <div style={{ textAlign:'center', fontSize:11.5, color:FADE }}>
        Parola va fi necesară la revenire.
      </div>

      {/* Made for Gabu */}
      <GlassCard accent={ORANGE} padding={20} style={{ borderRadius:22, textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:8 }} className="animate-float">🐱🚗</div>
        <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:14, color:ORANGE }}>
          Facut special pentru Gabu
        </div>
        <div style={{ fontSize:12, color:FADE, lineHeight:1.6, marginTop:6 }}>
          Fiecare sesiune te aduce mai aproape de permis.<br/>
          PisiPilot e mereu în dreapta ta. 🐾
        </div>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:6, marginTop:10,
          padding:'6px 14px', borderRadius:999,
          background:`${ORANGE}12`, border:`1px solid ${ORANGE}30`,
          color:ORANGE, fontSize:11, fontWeight:700,
          fontFamily:'Space Grotesk,system-ui',
        }}>
          💝 Cu drag, de la cineva care vrea să te vadă șoferind
        </div>
      </GlassCard>
    </div>
  )
}
