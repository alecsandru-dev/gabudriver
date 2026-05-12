'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { PrimaryButton } from '@/components/PrimaryButton'
import { resetState, clearPraiseHistory } from '@/lib/storage'

export default function SetariPage() {
  const router = useRouter()
  const [confirmReset, setConfirmReset]   = useState(false)
  const [confirmPraise, setConfirmPraise] = useState(false)
  const [done, setDone]                   = useState<string | null>(null)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login'); router.refresh()
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
    <div className="px-4 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
        <h1 className="font-display text-xl font-bold" style={{ color: '#F2F0FF' }}>Setări ⚙️</h1>
        <p className="text-sm mt-0.5" style={{ color: '#4C4C68' }}>Aplicație și progres</p>
      </motion.div>

      <PisiPilotBubble message="Totul e în ordine, Gabu. Dacă resetezi, o luăm de la zero împreună." mood="calm" />

      {done && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 chip-success">
          <p className="text-sm">✓ {done}</p>
        </motion.div>
      )}

      {/* App info */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-5"
        style={{ border: '1px solid rgba(0,200,255,0.2)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg,#00A8E8,#B44FFF)', boxShadow: '0 4px 16px rgba(0,200,255,0.3)' }}>
            🐱
          </div>
          <div>
            <p className="font-display font-bold" style={{ color: '#F2F0FF' }}>PisiPilot</p>
            <p className="text-xs" style={{ color: '#4C4C68' }}>v1.0 · Copilotul pufos al lui Gabu 🐾</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', color: '#9090A8' }}>
          PisiPilot este o aplicație de relaxare și antrenament informal. <strong style={{ color: '#F2F0FF' }}>Nu înlocuiește</strong> școala de șoferi, legislația oficială sau evaluarea psihologică autorizată.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5 space-y-3">
        <p className="font-display font-bold text-sm" style={{ color: '#F2F0FF' }}>Acțiuni</p>

        <button onClick={handleClearPraise}
          className="w-full text-left p-4 rounded-2xl tap-target transition-all"
          style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <p className="font-semibold text-sm" style={{ color: '#FFD700' }}>
            {confirmPraise ? '⚠️ Confirmi ștergerea laudelor?' : '🗑️ Șterge peretele de laude'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#4C4C68' }}>
            {confirmPraise ? 'Apasă din nou pentru confirmare' : 'Laudele rămân în suflet oricum'}
          </p>
        </button>

        <button onClick={handleResetProgress}
          className="w-full text-left p-4 rounded-2xl tap-target transition-all"
          style={{ background: 'rgba(255,42,138,0.08)', border: '1px solid rgba(255,42,138,0.2)' }}>
          <p className="font-semibold text-sm" style={{ color: '#FF2A8A' }}>
            {confirmReset ? '⚠️ Ești sigură? Resetează totul?' : '🔄 Resetează progresul'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#4C4C68' }}>
            {confirmReset ? 'Apasă din nou pentru confirmare' : 'XP, badge-uri, statistici — totul'}
          </p>
        </button>

        {(confirmReset || confirmPraise) && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => { setConfirmReset(false); setConfirmPraise(false) }}
            className="w-full p-3 rounded-2xl text-sm tap-target"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4C4C68' }}>
            ✕ Anulează
          </motion.button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <PrimaryButton onClick={handleLogout} fullWidth variant="danger">
          🚪 Delogare
        </PrimaryButton>
        <p className="text-xs text-center mt-2" style={{ color: '#4C4C68' }}>
          Parola va fi necesară la revenire.
        </p>
      </motion.div>

      {/* Made for Gabu */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="card p-5 text-center space-y-2 pb-2"
        style={{ border: '1px solid rgba(255,107,26,0.2)', boxShadow: 'var(--glass-shadow), 0 0 40px rgba(255,107,26,0.06)' }}
      >
        <div className="text-3xl animate-float">🐱🚗</div>
        <p className="font-display font-bold text-sm" style={{ color: '#FF6B1A' }}>Facut special pentru Gabu</p>
        <p className="text-xs leading-relaxed" style={{ color: '#4C4C68' }}>
          Fiecare sesiune te aduce mai aproape de permis.<br />
          PisiPilot e mereu în dreapta ta. 🐾
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mt-1"
          style={{ background: 'rgba(255,107,26,0.1)', border: '1px solid rgba(255,107,26,0.2)', color: '#FF6B1A', fontSize: 11, fontWeight: 700 }}>
          💝 Cu drag, de la cineva care vrea să te vadă șoferind
        </div>
      </motion.div>
    </div>
  )
}
