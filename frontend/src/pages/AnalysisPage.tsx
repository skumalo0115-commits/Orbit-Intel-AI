import { useEffect, useState } from 'react'
import EntityPanel from '../components/EntityPanel'
import SummaryPanel from '../components/SummaryPanel'
import api from '../services/api'

interface Analysis {
  summary: string
  classification: string
  entities: { text: string; type: string }[]
  insights?: Record<string, unknown>
}

export default function AnalysisPage({ documentId }: { documentId: number }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  useEffect(() => {
    const run = async () => {
      await api.post(`/analyze/${documentId}`)
      const response = await api.get<Analysis>(`/analysis/${documentId}`)
      setAnalysis(response.data)
    }
    run()
  }, [documentId])

  return (
    <div className="pt-28 px-6 pb-8 space-y-4">
      <div className="glass-card p-4">Classification: {analysis?.classification ?? '...'}</div>
      <div className="grid lg:grid-cols-2 gap-4">
        <SummaryPanel summary={analysis?.summary} />
        <EntityPanel entities={analysis?.entities} />
      </div>
      <div className="glass-card p-5 text-sm text-white/70">
        Insights: {analysis?.insights ? JSON.stringify(analysis.insights, null, 2) : 'Processing...'}
      </div>
    </div>
  )
}
