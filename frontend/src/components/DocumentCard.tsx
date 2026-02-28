interface DocumentCardProps {
  filename: string
  date: string
  onAnalyze: () => void
}

export default function DocumentCard({ filename, date, onAnalyze }: DocumentCardProps) {
  return (
    <div className="glass-card p-4 flex justify-between items-center">
      <div>
        <p className="font-semibold">{filename}</p>
        <p className="text-xs text-white/60">{new Date(date).toLocaleString()}</p>
      </div>
      <button className="text-cyan-300" onClick={onAnalyze}>Analyze</button>
    </div>
  )
}
