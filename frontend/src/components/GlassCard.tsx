import { PropsWithChildren } from 'react'

export default function GlassCard({ children }: PropsWithChildren) {
  return <div className="glass-card p-6">{children}</div>
}
