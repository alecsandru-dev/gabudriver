export async function fireConfetti(origin = { y: 0.65 }) {
  if (typeof window === 'undefined') return
  try {
    const { default: confetti } = await import('canvas-confetti')
    confetti({
      particleCount: 110,
      spread: 75,
      origin,
      colors: ['#00C8FF', '#FF2A8A', '#A8FF1E', '#FF6B1A', '#B44FFF', '#FFD700'],
      ticks: 200,
      gravity: 0.9,
      scalar: 0.9,
    })
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.7 },
        colors: ['#00C8FF', '#A8FF1E', '#FFD700'],
      })
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.7 },
        colors: ['#FF2A8A', '#B44FFF', '#FF6B1A'],
      })
    }, 150)
  } catch {}
}

export async function fireSmallConfetti() {
  if (typeof window === 'undefined') return
  try {
    const { default: confetti } = await import('canvas-confetti')
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#A8FF1E', '#00C8FF', '#FFD700'],
      scalar: 0.7,
    })
  } catch {}
}
