import { motion } from 'framer-motion'

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f172a,#020617_50%,#02040a)]" />
      {[1, 2, 3].map((orb) => (
        <motion.div
          key={orb}
          className="absolute rounded-full blur-3xl opacity-40"
          style={{
            width: 250 + orb * 100,
            height: 250 + orb * 100,
            background: orb % 2 ? '#00d9ff' : '#8b5cf6',
            top: `${orb * 20}%`,
            left: `${orb * 18}%`,
          }}
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8 + orb * 2, repeat: Infinity }}
        />
      ))}
    </div>
  )
}
