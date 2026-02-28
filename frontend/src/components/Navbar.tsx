import NeonButton from './NeonButton'

export default function Navbar({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="glass-card p-4 flex justify-between items-center fixed top-4 left-4 right-4 z-50">
      <h1 className="text-xl font-semibold tracking-wider">NebulaGlass AI</h1>
      <NeonButton onClick={onLogout}>Logout</NeonButton>
    </header>
  )
}
