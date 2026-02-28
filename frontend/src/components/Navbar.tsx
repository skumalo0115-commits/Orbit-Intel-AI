import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Home, BarChart3, LogOut } from 'lucide-react'

interface NavbarProps {
  onHome: () => void
  onResults: () => void
  onSignOut: () => void
  profileInitial: string
}

export default function Navbar({ onHome, onResults, onSignOut, profileInitial }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutside)
    return () => document.removeEventListener('mousedown', closeOnOutside)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5 }}
      className="glass-card h-[72px] px-6 flex justify-between items-center fixed top-4 left-4 right-4 z-50 border-b border-cyan-300/25"
    >
      <div className="flex items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}>
          <Brain className="text-violet-300" />
        </motion.div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Orbit Intel-AI</h1>
      </div>

      <div className="flex items-center gap-6 text-xl text-white/85">
        <button onClick={onHome} className="flex items-center gap-2 hover:text-cyan-300 transition">
          <Home size={20} /> Home
        </button>
        <button onClick={onResults} className="flex items-center gap-2 hover:text-cyan-300 transition">
          <BarChart3 size={20} /> Results
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full border border-cyan-300/50 bg-cyan-300/20 backdrop-blur-md flex items-center justify-center text-sm font-semibold text-white shadow-neon"
          >
            {profileInitial}
          </button>

          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 glass-card border border-violet-300/30 rounded-xl p-2 min-w-[150px]"
            >
              <button
                onClick={() => {
                  setOpen(false)
                  onSignOut()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-left"
              >
                <LogOut size={16} className="text-pink-300" /> Sign out
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
