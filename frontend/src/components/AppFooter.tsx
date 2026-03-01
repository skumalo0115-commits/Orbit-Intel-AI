import { FormEvent, useState } from 'react'
import { Brain, Facebook, Github, Globe, Linkedin, Mail, MessageCircle } from 'lucide-react'

export default function AppFooter() {
  const [email, setEmail] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    const subject = encodeURIComponent('Career insights newsletter subscription')
    const body = encodeURIComponent(`Please subscribe this email to career insights updates: ${email}`)
    window.location.href = `mailto:s.kumalo0115@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <footer className="border-t border-white/15 mt-10">
      <div className="max-w-[1280px] mx-auto px-8 lg:px-12 py-12">
        <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4"><Brain className="text-violet-400" /><h4 className="text-3xl font-semibold bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Orbit Intel-AI</h4></div>
            <p className="text-[#aab3c2] text-lg max-w-md">Empowering your future with intelligent career guidance powered by advanced AI technology.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a aria-label="GitHub" href="https://github.com/skumalo0115-commits" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Github /></a>
              <a aria-label="LinkedIn" href="https://www.linkedin.com/in/sbahle-kumalo-b4b498267" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Linkedin /></a>
              <a aria-label="Facebook" href="https://www.facebook.com/IssUrSlime" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Facebook /></a>
              <a aria-label="Portfolio" href="https://sbahle-kumalo-emerging-technologies.base44.app/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Globe /></a>
              <a aria-label="WhatsApp" href="https://wa.me/27827744933" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><MessageCircle /></a>
            </div>
          </div>
          <div>
            <h5 className="text-2xl font-semibold text-violet-300 mb-3">Company</h5>
            <ul className="text-[#aab3c2] space-y-2 text-lg"><li>About</li><li>Contact</li><li>Support</li></ul>
          </div>
          <div>
            <h5 className="text-2xl font-semibold text-violet-300 mb-3">Legal</h5>
            <ul className="text-[#aab3c2] space-y-2 text-lg"><li>Privacy</li><li>Terms</li><li>Security</li></ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#aab3c2] text-lg"><Mail size={18} /> Subscribe to our newsletter for career insights</div>
          <form onSubmit={submit} className="flex items-center gap-2 w-full md:w-auto">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Enter your email" className="bg-black/40 border border-violet-400/35 rounded-xl px-4 py-3 min-w-[260px] outline-none" />
            <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold shadow-neon">Subscribe</button>
          </form>
        </div>
      </div>
    </footer>
  )
}
