interface Entity {
  text: string
  type: string
  score?: number
}

export default function EntityPanel({ entities }: { entities?: Entity[] }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-cyan-300 mb-2">Entities</h3>
      <div className="space-y-2">
        {(entities || []).map((entity, idx) => (
          <div key={`${entity.text}-${idx}`} className="text-sm text-white/80 flex justify-between">
            <span>{entity.text}</span>
            <span className="text-white/60">{entity.type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
