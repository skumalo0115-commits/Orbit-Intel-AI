export default function SummaryPanel({ summary }: { summary?: string }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-cyan-300 mb-2">Summary</h3>
      <p className="text-white/80 text-sm whitespace-pre-wrap">{summary || 'No summary yet.'}</p>
    </div>
  )
}
