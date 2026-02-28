import { Upload } from 'lucide-react'
import { ChangeEvent, DragEvent, useState } from 'react'

interface UploadZoneProps {
  onFile: (file: File) => void
}

export default function UploadZone({ onFile }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onFile(file)
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`glass-card glass-card-hover flex flex-col items-center justify-center border-2 border-dashed p-10 text-center cursor-pointer ${dragging ? 'border-cyan-300 shadow-neon' : 'border-cyan-300/40'}`}
    >
      <Upload className="mb-3 text-cyan-300" />
      <p className="text-lg">Drag and drop to upload</p>
      <p className="text-sm text-white/60">PDF, DOCX, TXT, CSV, PNG, JPG, JPEG</p>
      <input type="file" className="hidden" onChange={handleChange} />
    </label>
  )
}
