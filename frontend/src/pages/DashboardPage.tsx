import { useEffect, useState } from 'react'
import DocumentCard from '../components/DocumentCard'
import GlassCard from '../components/GlassCard'
import UploadZone from '../components/UploadZone'
import api from '../services/api'

interface DocumentItem {
  id: number
  filename: string
  upload_date: string
}

export default function DashboardPage({ onSelect }: { onSelect: (id: number) => void }) {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [uploading, setUploading] = useState(false)

  const loadDocuments = async () => {
    const response = await api.get<DocumentItem[]>('/documents')
    setDocs(response.data)
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const upload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    await api.post('/upload', formData)
    setUploading(false)
    await loadDocuments()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 pt-28 px-6 pb-8">
      <div className="lg:col-span-1 space-y-4">
        <UploadZone onFile={upload} />
        <GlassCard>{uploading ? 'Uploading...' : 'Ready to ingest your next document.'}</GlassCard>
      </div>
      <div className="lg:col-span-2 space-y-3">
        {docs.map((doc) => (
          <DocumentCard key={doc.id} filename={doc.filename} date={doc.upload_date} onAnalyze={() => onSelect(doc.id)} />
        ))}
      </div>
    </div>
  )
}
