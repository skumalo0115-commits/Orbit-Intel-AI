const items = ['Dashboard', 'Documents', 'Analysis', 'Settings']

export default function Sidebar() {
  return (
    <aside className="glass-card p-5 h-full w-[260px]">
      <p className="text-cyan-300 mb-4 font-medium">Workspace</p>
      <ul className="space-y-2 text-sm text-white/80">
        {items.map((item, idx) => (
          <li
            key={item}
            className={`px-3 py-2 rounded-lg transition ${idx === 0 ? 'bg-cyan-300/15 border border-cyan-300/35 shadow-neon' : 'hover:bg-white/10'}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  )
}
