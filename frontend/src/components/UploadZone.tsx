import { Upload } from 'lucide-react'
import { ChangeEvent } from 'react'

interface UploadZoneProps {
  onFile: (file: File) => void
}

export default function UploadZone({ onFile }: UploadZoneProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <label className="glass-card flex flex-col items-center justify-center border-dashed p-10 text-center cursor-pointer">
      <Upload className="mb-3 text-cyan-300" />
      <p className="text-lg">Drag and drop or click to upload</p>
      <p className="text-sm text-white/60">PDF, DOCX, TXT, CSV, PNG, JPG</p>
      <input type="file" className="hidden" onChange={handleChange} />
    </label>
  )
}
