import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Home, LogOut, UserCircle } from 'lucide-react'

interface NavbarProps {
  onHome: () => void
  onSignOut: () => void
  onOpenProfile: () => void
  profileInitial: string
  profileImageUrl: string
  profileUsername: string
  profileEmail: string
}

export default function Navbar({ onHome, onSignOut, onOpenProfile, profileInitial, profileImageUrl, profileUsername, profileEmail }: NavbarProps) {
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
      className="fixed top-4 left-4 right-4 z-50 flex h-[72px] items-center justify-between rounded-[28px] border border-violet-300/15 bg-[linear-gradient(180deg,rgba(8,8,14,0.82),rgba(18,10,30,0.76))] px-6 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}>
          <Brain className="text-violet-300" />
        </motion.div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Orbit Intel-AI</h1>
      </div>

      <div className="flex items-center gap-6 text-xl text-white/85">
        <motion.button whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.97 }} onClick={onHome} className="flex items-center gap-2 hover:text-cyan-300 transition">
          <Home size={20} /> Home
        </motion.button>

        <div className="relative" ref={menuRef}>
          <motion.button
            whileHover={{ scale: 1.14, boxShadow: '0 0 24px rgba(34,211,238,0.55)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-cyan-300/35 bg-cyan-300/12 text-sm font-semibold text-white shadow-neon backdrop-blur-md"
          >
            {profileImageUrl ? <img src={profileImageUrl} alt="" className="h-full w-full object-cover" /> : profileInitial}
          </motion.button>

          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-3 w-[250px] rounded-2xl border border-violet-300/20 bg-[linear-gradient(180deg,rgba(9,9,15,0.96),rgba(19,11,30,0.94))] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-md"
            >
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-300/35 bg-cyan-300/12 text-sm font-semibold">
                  {profileImageUrl ? <img src={profileImageUrl} alt="" className="h-full w-full object-cover" /> : profileInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{profileUsername || 'Your profile'}</p>
                  <p className="truncate text-xs text-white/55">{profileEmail || 'Signed in'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false)
                  onOpenProfile()
                }}
                className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/10"
              >
                <UserCircle size={16} className="text-cyan-300" /> Profile
              </button>
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
