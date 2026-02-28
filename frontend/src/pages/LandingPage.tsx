import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Brain,
  ChevronDown,
  Crosshair,
  Facebook,
  Github,
  Globe,
  Linkedin,
  Rocket,
  Sparkles,
  TrendingUp,
  WandSparkles,
  Zap,
  MessageCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'

type MiniCardProps = {
  icon: 'analysis' | 'precision' | 'growth'
  title: string
  description: string
  delay: number
}

type CareerCardProps = {
  title: string
  description: string
  image: string
  tint: string
  delay: number
}

type HowCardProps = {
  title: string
  description: string
  delay: number
  icon: 'share' | 'analysis' | 'roadmap'
}

function MiniFeatureCard({ icon, title, description, delay }: MiniCardProps) {
  const Icon = icon === 'analysis' ? Sparkles : icon === 'precision' ? Crosshair : TrendingUp
  const color = icon === 'analysis' ? '#FACC15' : icon === 'precision' ? '#A855F7' : '#10B981'

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="rounded-2xl border border-white/20 bg-white/[0.03] backdrop-blur-xl p-5 min-h-[170px] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      <Icon size={28} style={{ color }} className="mb-3" />
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-[#bfc7d6] text-base leading-relaxed">{description}</p>
    </motion.div>
  )
}

function CareerPathCard({ title, description, image, tint, delay }: CareerCardProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0, scale: 1.08 })

  return (
    <motion.article
      initial={{ opacity: 0, y: 36, scale: 0.985, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      whileHover={{ y: -8, scale: 1.015 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const nx = (e.clientX - rect.left) / rect.width - 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5
        const x = nx * 18
        const y = ny * 18
        const scale = 1.08 + Math.min(0.1, Math.hypot(nx, ny) * 0.13)
        setMouse({ x, y, scale })
      }}
      onMouseLeave={() => setMouse({ x: 0, y: 0, scale: 1.08 })}
      className="relative overflow-hidden rounded-2xl border border-white/15 min-h-[210px] md:min-h-[240px] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        animate={{ scale: mouse.scale, x: mouse.x, y: mouse.y }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 bg-black/28" />
      <div className="absolute inset-0" style={{ background: tint }} />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="absolute bottom-4 left-5 z-10">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.28, delay: delay + 0.06 }}
          className="text-3xl md:text-4xl font-semibold"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.28, delay: delay + 0.1 }}
          className="text-[#d7deea] text-lg md:text-xl mt-1"
        >
          {description}
        </motion.p>
      </div>
    </motion.article>
  )
}

function HowItWorksCard({ title, description, delay, icon }: HowCardProps) {
  const Icon = icon === 'share' ? WandSparkles : icon === 'analysis' ? Brain : Zap

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      whileHover={{ y: -4, scale: 1.01 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.42, delay }}
      className="group rounded-2xl border border-white/20 bg-[linear-gradient(130deg,rgba(124,58,237,0.14),rgba(0,0,0,0.55),rgba(0,217,255,0.12))] p-5 md:p-6 flex items-center gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.38)]"
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-cyan-400 text-white shrink-0 group-hover:scale-110 transition">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold mb-1">{title}</h3>
        <p className="text-[#c7d0de] text-lg md:text-xl">{description}</p>
      </div>
    </motion.div>
  )
}

function FinalLaunchCard({ onEnter }: { onEnter: () => void }) {
  const [mouse, setMouse] = useState({ x: 50, y: 50 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      whileHover={{ y: -6, scale: 1.012 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMouse({ x, y })
      }}
      className="relative overflow-hidden rounded-2xl border border-white/20 p-7 md:p-8 text-center shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      style={{
        backgroundImage: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(0,217,255,0.18), transparent 38%), linear-gradient(130deg, rgba(124,58,237,0.18), rgba(0,0,0,0.6), rgba(0,217,255,0.14))`,
      }}
    >
      <motion.div
        className="flex justify-center mb-3"
        animate={{ y: [0, -7, 0], rotate: [-5, 5, -5] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Rocket size={34} className="text-cyan-300" />
      </motion.div>

      <h3 className="text-3xl md:text-5xl font-semibold mb-2">Ready to Launch Your Career?</h3>
      <p className="text-[#c7d0de] text-base md:text-xl mb-5">Join thousands of professionals who've found their perfect path</p>

      <motion.button
        onClick={onEnter}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-3 px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-lg md:text-xl font-semibold shadow-[0_0_30px_rgba(124,58,237,0.65)]"
      >
        Start Your Analysis
        <motion.span animate={{ x: [0, 6, 0], y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <Rocket size={18} />
        </motion.span>
      </motion.button>
    </motion.div>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/15 mt-6">
      <div className="max-w-[1280px] mx-auto px-8 lg:px-12 py-12">
        <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-violet-400" />
              <h4 className="text-3xl font-semibold bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">AI Career System</h4>
            </div>
            <p className="text-[#aab3c2] text-lg max-w-md">Empowering your future with intelligent career guidance powered by advanced AI technology.</p>
          </div>

          <div>
            <h5 className="text-2xl font-semibold text-violet-300 mb-3">Connect</h5>
            <div className="flex flex-wrap gap-3">
              <a aria-label="GitHub" href="https://github.com/skumalo0115-commits" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Github /></a>
              <a aria-label="LinkedIn" href="https://www.linkedin.com/in/sbahle-kumalo-b4b498267" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Linkedin /></a>
              <a aria-label="Facebook" href="https://www.facebook.com/IssUrSlime" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Facebook /></a>
              <a aria-label="Portfolio" href="https://sbahle-kumalo-emerging-technologies.base44.app/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Globe /></a>
              <a aria-label="WhatsApp" href="https://wa.me/27827744933" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><MessageCircle /></a>
            </div>
          </div>

          <div>
            <h5 className="text-2xl font-semibold text-violet-300 mb-3">Legal</h5>
            <ul className="text-[#aab3c2] space-y-2 text-lg">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Security</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 text-center text-[#97a3b7] text-lg">
          © 2026 AI Career System. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const { scrollY } = useScroll()
  const scrollOpacity = useTransform(scrollY, [0, 90], [1, 0])
  const scrollYPos = useTransform(scrollY, [0, 90], [0, 20])
  const heroFadeToBlack = useTransform(scrollY, [0, 500], [0.35, 0.95])

  const bgStyle = useMemo(
    () => ({
      backgroundImage: "url('https://wallstreetpit.com/wp-content/uploads/news/ai-cg/AI5-G.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }),
    []
  )

  return (
    <div className="bg-black">
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0" style={bgStyle} />
        <motion.div style={{ opacity: heroFadeToBlack }} className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.14),transparent_45%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-5xl"
        >
          <motion.div className="mb-6 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
            <div className="w-20 h-20 rounded-full border border-cyan-300/35 bg-cyan-300/10 flex items-center justify-center shadow-neon">
              <Brain className="text-cyan-300" size={46} />
            </div>
          </motion.div>

          <h1 className="font-['Space_Grotesk'] text-6xl md:text-8xl font-bold tracking-[-0.02em] leading-[1.03]">
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent">Your Future</span>
            <br />
            <span className="text-white">Starts Here</span>
          </h1>

          <p className="text-[#c5d0df] text-2xl max-w-4xl mx-auto mt-7 leading-relaxed">
            Discover your perfect career path with AI-powered insights. Transform your skills into opportunities.
          </p>

          <motion.button
            onClick={onEnter}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-12 inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_35px_rgba(124,58,237,0.65)] transition font-semibold text-2xl"
          >
            Begin Your Journey
            <motion.span animate={{ x: [0, 6, 0], y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Rocket size={24} />
            </motion.span>
          </motion.button>

          <motion.div style={{ opacity: scrollOpacity, y: scrollYPos }} className="mt-5 flex flex-col items-center text-[#a0aec0]" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <ChevronDown className="text-cyan-300" />
            <span className="text-xl">Scroll to explore</span>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative px-8 lg:px-12 pb-14 pt-10 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-['Space_Grotesk'] text-5xl md:text-6xl font-bold tracking-[-0.02em] bg-gradient-to-r from-violet-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
            Powered by Intelligence
          </h2>
          <p className="text-[#C5CFDD] text-xl mt-3">Next-generation career guidance at your fingertips</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4">
          <MiniFeatureCard
            icon="analysis"
            title="AI Analysis"
            description="Advanced algorithms analyze your skills and interests for precise guidance."
            delay={0.05}
          />
          <MiniFeatureCard
            icon="precision"
            title="Precision Matching"
            description="Get personalized career recommendations with confidence scoring."
            delay={0.15}
          />
          <MiniFeatureCard
            icon="growth"
            title="Growth Path"
            description="Receive a roadmap to bridge gaps and accelerate your direction."
            delay={0.25}
          />
        </div>
      </section>

      <section className="relative px-8 lg:px-12 pb-16 pt-6 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-['Space_Grotesk'] text-5xl md:text-6xl font-bold tracking-[-0.02em] bg-gradient-to-r from-cyan-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
            Explore Career Paths
          </h2>
          <p className="text-[#C5CFDD] text-xl mt-3">Discover opportunities across diverse industries</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          <CareerPathCard
            title="Tech & Engineering"
            description="Shape the future with cutting-edge technology"
            image="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80"
            tint="linear-gradient(180deg, rgba(93,32,156,0.12), rgba(167,34,196,0.45))"
            delay={0.05}
          />
          <CareerPathCard
            title="Data & Analytics"
            description="Turn data into actionable insights"
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
            tint="linear-gradient(180deg, rgba(18,69,138,0.12), rgba(28,126,175,0.45))"
            delay={0.13}
          />
          <CareerPathCard
            title="Business & Leadership"
            description="Lead teams and drive innovation"
            image="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
            tint="linear-gradient(180deg, rgba(112,29,76,0.12), rgba(184,41,121,0.45))"
            delay={0.21}
          />
          <CareerPathCard
            title="Creative & Design"
            description="Bring visions to life through design"
            image="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80"
            tint="linear-gradient(180deg, rgba(81,26,121,0.12), rgba(123,52,183,0.45))"
            delay={0.29}
          />
        </div>
      </section>

      <section className="relative px-8 lg:px-12 pb-16 pt-6 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-['Space_Grotesk'] text-5xl md:text-6xl font-bold tracking-[-0.02em] bg-gradient-to-r from-pink-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-[#C5CFDD] text-xl mt-3">Three simple steps to your dream career</p>
        </motion.div>

        <div className="space-y-4">
          <HowItWorksCard
            icon="share"
            title="Share Your Profile"
            description="Tell us about your skills, interests, and career aspirations."
            delay={0.06}
          />
          <HowItWorksCard
            icon="analysis"
            title="AI Analysis"
            description="Our advanced AI analyzes thousands of career paths to find your perfect matches."
            delay={0.14}
          />
          <HowItWorksCard
            icon="roadmap"
            title="Get Your Roadmap"
            description="Receive personalized recommendations and a clear path to success."
            delay={0.22}
          />
        </div>
      </section>

      <section className="relative px-8 lg:px-12 pb-20 pt-12 max-w-[980px] mx-auto">
        <FinalLaunchCard onEnter={onEnter} />
      </section>

      <LandingFooter />
    </div>
  )
}
