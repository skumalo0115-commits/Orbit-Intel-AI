export default function Sidebar() {
  return (
    <aside className="glass-card p-4 h-full">
      <p className="text-cyan-300 mb-2">AI Modules</p>
      <ul className="space-y-2 text-sm text-white/70">
        <li>Classification</li>
        <li>Summarization</li>
        <li>Entity Extraction</li>
        <li>Embeddings</li>
      </ul>
    </aside>
  )
}
