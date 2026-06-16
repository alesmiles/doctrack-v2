import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

export type UploadState = "idle" | "uploading" | "ready"

interface UploadZoneProps {
  uploadState: UploadState
  uploadedFileName: string
  onFile: (file: File) => void
  onLinkUpload: (url: string) => void
  onOpenDoc: () => void
}

export function UploadZone({ uploadState, uploadedFileName, onFile, onLinkUpload, onOpenDoc }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [link, setLink] = useState("")
  const [linkError, setLinkError] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  function handleLinkUpload() {
    if (!link.startsWith("https://docs.google.com")) {
      setLinkError(true)
      return
    }
    setLinkError(false)
    onLinkUpload(link)
  }

  if (uploadState === "uploading") {
    return (
      <div className="border-2 border-dashed border-blue-200 rounded-lg bg-white p-4 flex items-center justify-center gap-2">
        <svg className="animate-spin h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-[12px] text-blue-600">Generating document...</span>
      </div>
    )
  }

  if (uploadState === "ready") {
    return (
      <div className="border-2 border-dashed border-green-200 rounded-lg bg-green-50/30 p-4 flex items-center justify-between gap-3">
        <span className="text-[12px] text-gray-700 truncate min-w-0">✓ {uploadedFileName}</span>
        <button
          onClick={onOpenDoc}
          className="text-[12px] font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap flex-shrink-0"
        >
          Open Document →
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          dragOver ? "border-blue-400 bg-blue-50" : "border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
        )}
      >
        <p className="text-[12px] text-gray-500 mb-1">📎 Drag a file here or</p>
        <span className="text-[12px] text-blue-600 font-medium hover:underline">Browse</span>
        <p className="text-[10px] text-gray-400 mt-1">.xlsx .xls .pdf</p>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.pdf" className="hidden" onChange={handleFileChange} />
      </div>

      <p className="text-[11px] text-blue-800/60">or paste a Google Sheets link:</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={link}
          onChange={(e) => { setLink(e.target.value); setLinkError(false) }}
          placeholder="https://docs.google.com/spreadsheets/..."
          className={cn(
            "flex-1 text-[11px] border rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-300",
            linkError ? "border-red-300" : "border-gray-200"
          )}
        />
        <button
          onClick={handleLinkUpload}
          className="text-[11px] bg-blue-600 text-white rounded-md px-3 py-1.5 hover:bg-blue-700 whitespace-nowrap"
        >
          Load from link →
        </button>
      </div>
      {linkError && (
        <p className="text-[11px] text-red-500 -mt-1">Please enter a valid Google Sheets link</p>
      )}
    </div>
  )
}
