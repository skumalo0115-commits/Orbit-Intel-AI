import { useEffect, useState } from 'react'

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (event: MouseEvent) => setPos({ x: event.clientX, y: event.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(0,217,255,0.2), transparent 40%)`,
      }}
    />
  )
}
