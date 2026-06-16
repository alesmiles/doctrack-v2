import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UploadZone, type UploadState } from "@/components/UploadZone"

export interface ClientDocFormData {
  client: string
  project: string
  docType: string
  signDate: string
  docNum: string
  manager: string
  comment: string
  uploadState: UploadState
  uploadedFileName: string
}

interface CreateClientDocModalProps {
  open: boolean
  onClose: () => void
  onNavigate: (page: string) => void
  onBack?: () => void
  onSaveForm?: (data: ClientDocFormData) => void
  initialValues?: ClientDocFormData
  initialClient?: string
  initialProject?: string
  initialManagerDO?: string
}

const CLIENTS = ["Alpha Media", "Tutu.ru", "SberMarket", "Yandex"]
const PROJECTS: Record<string, string[]> = {
  "Alpha Media": ["ALF-9 · March 2025", "ALF-10 · April 2025"],
  "Tutu.ru": ["TTU-3 · March 2025"],
  "SberMarket": ["SBR-1 · April 2025"],
  "Yandex": ["YND-5 · May 2025"],
}
const DOC_TYPES = ["Annex", "Act", "Invoice", "Tax Invoice", "Addendum", "UPD", "Contract"]
const MANAGERS = ["Inna Mikhrabova", "Dmitry Larin"]

const SL = "text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2.5"
const ERR = "text-[11px] text-red-500 mt-1"
const ERR_RING = "border-red-400 ring-1 ring-red-400"

function generateDocNum(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `DO-${d.getFullYear()}-${mm}${dd}`
}

export function CreateClientDocModal({
  open, onClose, onNavigate, onBack, onSaveForm, initialValues,
  initialClient, initialProject, initialManagerDO,
}: CreateClientDocModalProps) {
  const [client, setClient] = useState(initialClient ?? "")
  const [project, setProject] = useState(initialProject ?? "")
  const [docType, setDocType] = useState("")
  const [signDate, setSignDate] = useState("")
  const [docNum, setDocNum] = useState("")
  const [manager, setManager] = useState(initialManagerDO ?? "")
  const [comment, setComment] = useState("")
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setClient(initialValues.client)
        setProject(initialValues.project)
        setDocType(initialValues.docType)
        setSignDate(initialValues.signDate)
        setDocNum(initialValues.docNum)
        setManager(initialValues.manager)
        setComment(initialValues.comment)
        setUploadState(initialValues.uploadState)
        setUploadedFileName(initialValues.uploadedFileName)
      } else {
        setClient(initialClient ?? "")
        setProject(initialProject ?? "")
        setDocType("")
        setSignDate("")
        setDocNum("")
        setManager(initialManagerDO ?? "")
        setComment("")
        setUploadState("idle")
        setUploadedFileName("")
      }
      setErrors({})
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function clearError(key: string) {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: false }))
  }

  function handleUpload(displayName: string) {
    setUploadedFileName(displayName)
    setUploadState("uploading")
    setDocNum(generateDocNum())
    setTimeout(() => setUploadState("ready"), 1500)
  }

  function handleOpenDoc() {
    onNavigate("document-editor")
  }

  function handleCreate() {
    const newErrors: Record<string, boolean> = {}
    if (!client) newErrors.client = true
    if (!project) newErrors.project = true
    if (!docType) newErrors.docType = true
    if (!signDate) newErrors.signDate = true
    if (!manager) newErrors.manager = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSaveForm?.({ client, project, docType, signDate, docNum, manager, comment, uploadState, uploadedFileName })
    onNavigate("document-editor")
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mt-0.5 flex-shrink-0"
              >
                ← Back
              </button>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-[15px] font-semibold text-gray-900">Client Document</DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">Create or register a document for a client project</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
          <div>
            <p className={SL}>Project Link</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Client</label>
                {initialClient ? (
                  <Input value={initialClient} readOnly className="h-[34px] text-[13px] bg-gray-50 text-gray-600" />
                ) : (
                  <>
                    <Select
                      value={client}
                      onValueChange={(v) => { setClient(v); setProject(""); clearError("client") }}
                    >
                      <SelectTrigger className={cn("h-[34px] text-[13px]", errors.client && ERR_RING)}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>{CLIENTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.client && <p className={ERR}>Required field</p>}
                  </>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Project</label>
                {initialProject ? (
                  <Input value={initialProject} readOnly className="h-[34px] text-[13px] bg-gray-50 text-gray-600" />
                ) : (
                  <>
                    <Select
                      value={project}
                      onValueChange={(v) => { setProject(v); clearError("project") }}
                      disabled={!client}
                    >
                      <SelectTrigger className={cn("h-[34px] text-[13px]", errors.project && ERR_RING)}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>{(PROJECTS[client] ?? []).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.project && <p className={ERR}>Required field</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className={SL}>Type &amp; Parameters</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Document Type</label>
                <Select value={docType} onValueChange={(v) => { setDocType(v); clearError("docType") }}>
                  <SelectTrigger className={cn("h-[34px] text-[13px]", errors.docType && ERR_RING)}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>{DOC_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                {errors.docType && <p className={ERR}>Required field</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Planned Signing Date</label>
                <Input
                  type="date"
                  value={signDate}
                  onChange={(e) => { setSignDate(e.target.value); clearError("signDate") }}
                  className={cn("h-[34px] text-[13px]", errors.signDate && ERR_RING)}
                />
                {errors.signDate && <p className={ERR}>Required field</p>}
              </div>
            </div>
          </div>

          <div>
            <p className={SL}>AI Document Generation</p>
            <p className="text-[11px] text-blue-700 -mt-1.5 mb-2.5">
              ✦ Upload your estimate — AI will generate the annex in 2 minutes
            </p>
            <UploadZone
              uploadState={uploadState}
              uploadedFileName={uploadedFileName}
              onFile={(file) => handleUpload(file.name)}
              onLinkUpload={(url) => handleUpload(url)}
              onOpenDoc={handleOpenDoc}
            />
          </div>

          <div>
            <p className={SL}>Document Details</p>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Document Number</label>
                <Input
                  value={docNum}
                  onChange={(e) => uploadState !== "idle" && setDocNum(e.target.value)}
                  readOnly={uploadState === "idle"}
                  placeholder={uploadState === "idle" ? "Auto-filled after upload" : ""}
                  className={cn(
                    "h-[34px] text-[13px]",
                    uploadState === "idle" && "bg-gray-50 text-gray-400 cursor-not-allowed"
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Doc Manager</label>
                <Select value={manager} onValueChange={(v) => { setManager(v); clearError("manager") }}>
                  <SelectTrigger className={cn("h-[34px] text-[13px]", errors.manager && ERR_RING)}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>{MANAGERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                {errors.manager && <p className={ERR}>Required field</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Comment</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conditions, agreements, context..."
                rows={3}
                className="text-[13px] resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                E.g. "client needs two originals", "agreed to postpone to the 20th", "waiting for director's signature". Saved in the document card.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleCreate}>Create Document</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
