import { memo } from 'react'
import { motion } from 'framer-motion'

const orbs = [
  { size: 380, top: '8%', left: '6%', color: '#00D9FF', duration: 9 },
  { size: 420, top: '22%', left: '58%', color: '#7C3AED', duration: 11 },
  { size: 300, top: '58%', left: '12%', color: '#FF00AA', duration: 10 },
  { size: 360, top: '66%', left: '55%', color: '#00D9FF', duration: 12 },
  { size: 340, top: '38%', left: '34%', color: '#7C3AED', duration: 8 },
  { size: 280, top: '74%', left: '75%', color: '#FF00AA', duration: 13 },
]

function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-[#03060F]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#0B1A3A,transparent_45%),radial-gradient(circle_at_80%_70%,#1A0B3A,transparent_45%),linear-gradient(180deg,#060A1A_0%,#0B1026_100%)]" />

      {orbs.map((orb, idx) => (
        <motion.div
          key={`${orb.color}-${idx}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: orb.color,
            filter: 'blur(120px)',
            opacity: 0.3,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          animate={{ y: [-10, 10, -10], x: [-8, 8, -8] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {Array.from({ length: 32 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/40"
          style={{
            width: 2,
            height: 2,
            top: `${(i * 17) % 100}%`,
            left: `${(i * 29) % 100}%`,
          }}
          animate={{ y: [0, -14, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="noise-overlay absolute inset-0" />
    </div>
  )
}

export default memo(SpaceBackground)
