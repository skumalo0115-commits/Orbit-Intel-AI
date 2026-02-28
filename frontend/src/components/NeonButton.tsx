import { ButtonHTMLAttributes, PropsWithChildren } from 'react'

export default function NeonButton({ children, className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={`px-5 py-2 rounded-xl bg-cyan-400/20 border border-cyan-300/50 shadow-neon hover:bg-cyan-300/30 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
