import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neon accent palette — the character of PisiPilot
        neon: {
          cyan:   '#00C8FF',
          pink:   '#FF2A8A',
          lime:   '#A8FF1E',
          orange: '#FF6B1A',
          blue:   '#4B7FFF',
          purple: '#B44FFF',
          gold:   '#FFD700',
        },
        // Dark surface scale
        surface: {
          0: '#05050C',
          1: '#08080F',
          2: '#0C0C18',
          3: '#121220',
          4: '#1A1A2C',
        },
        // Legacy pisi tokens kept for backward compat
        pisi: {
          bg:      '#08080F',
          elevated:'#121220',
          warm:    '#FF6B1A',
          orange:  '#FF8E53',
          purple:  '#B44FFF',
          mint:    '#A8FF1E',
          amber:   '#FFD700',
          card:    '#121220',
          text:    '#F2F0FF',
          muted:   '#9090A8',
          dim:     '#4C4C68',
          border:  '#1E1E32',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display',
          'SF Pro Text', 'system-ui', 'sans-serif',
        ],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        'spin-slow':   { to: { transform: 'rotate(360deg)' } },
        'pulse-glow':  { '0%,100%': { opacity: '0.5' }, '50%': { opacity: '1' } },
        'float':       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'float-sm':    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        'slide-up':    { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':     { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in':      { from: { opacity: '0', transform: 'scale(0.8)' }, '70%': { transform: 'scale(1.06)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'shimmer':     { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        'breathe-in':  { from: { transform: 'scale(1)', opacity: '0.7' }, to: { transform: 'scale(1.35)', opacity: '1' } },
        'breathe-out': { from: { transform: 'scale(1.35)', opacity: '1' }, to: { transform: 'scale(1)', opacity: '0.7' } },
        'shake':       { '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-6px)' }, '40%': { transform: 'translateX(6px)' }, '60%': { transform: 'translateX(-4px)' }, '80%': { transform: 'translateX(4px)' } },
        'orb-drift-1': { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(40px,-30px) scale(1.05)' }, '66%': { transform: 'translate(-20px,20px) scale(0.95)' } },
        'orb-drift-2': { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(-50px,30px) scale(1.08)' } },
        'orb-drift-3': { '0%,100%': { transform: 'translate(0,0)' }, '40%': { transform: 'translate(30px,-20px)' }, '80%': { transform: 'translate(-15px,15px)' } },
      },
      animation: {
        'spin-slow':    'spin-slow 8s linear infinite',
        'pulse-glow':   'pulse-glow 2.5s ease-in-out infinite',
        'float':        'float 3.5s ease-in-out infinite',
        'float-sm':     'float-sm 2.5s ease-in-out infinite',
        'slide-up':     'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':      'fade-in 0.3s ease-out',
        'pop-in':       'pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer':      'shimmer 2.5s linear infinite',
        'shake':        'shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97)',
        'orb-drift-1':  'orb-drift-1 20s ease-in-out infinite',
        'orb-drift-2':  'orb-drift-2 25s ease-in-out infinite',
        'orb-drift-3':  'orb-drift-3 18s ease-in-out infinite',
      },
      boxShadow: {
        // Glass cards
        'glass':        '0 4px 6px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
        'glass-lg':     '0 8px 12px rgba(0,0,0,0.4), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        // Neon glows
        'neon-cyan':    '0 0 20px rgba(0,200,255,0.5), 0 0 40px rgba(0,200,255,0.2)',
        'neon-pink':    '0 0 20px rgba(255,42,138,0.5), 0 0 40px rgba(255,42,138,0.2)',
        'neon-lime':    '0 0 20px rgba(168,255,30,0.4), 0 0 40px rgba(168,255,30,0.15)',
        'neon-orange':  '0 0 20px rgba(255,107,26,0.5), 0 0 40px rgba(255,107,26,0.2)',
        'neon-blue':    '0 0 20px rgba(75,127,255,0.5), 0 0 40px rgba(75,127,255,0.2)',
        'neon-purple':  '0 0 20px rgba(180,79,255,0.5), 0 0 40px rgba(180,79,255,0.2)',
        // Subtle inner top highlight for 3D effect
        'inner-top':    'inset 0 1px 0 rgba(255,255,255,0.15)',
        // Float elevation
        'float-nav':    '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset',
      },
    },
  },
  plugins: [],
}
export default config
