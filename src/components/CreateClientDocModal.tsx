import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UploadZone, type UploadState } from "@/components/UploadZone"
import { CLIENT_NAMES } from "@/utils/clients"

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
  onNavigate: (page: string, context?: { project: string }) => void
  onBack?: () => void
  onSaveForm?: (data: ClientDocFormData) => void
  initialValues?: ClientDocFormData
  initialClient?: string
  initialProject?: string
  initialManagerDO?: string
}

const DOC_TYPES = ["Приложение", "Акт", "Счёт", "Счёт-фактура", "ДС", "УПД", "Договор"]
const MANAGERS = ["Инна Михрабова", "Полина Волкова"]

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

  function validateAndSave(): boolean {
    const newErrors: Record<string, boolean> = {}
    if (!client) newErrors.client = true
    if (!project) newErrors.project = true
    if (!docType) newErrors.docType = true
    if (!signDate) newErrors.signDate = true
    if (!manager) newErrors.manager = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    onSaveForm?.({ client, project, docType, signDate, docNum, manager, comment, uploadState, uploadedFileName })
    return true
  }

  function handleOpenDoc() {
    if (!validateAndSave()) return
    onNavigate("document-editor", { project })
  }

  function handleCreate() {
    if (!validateAndSave()) return
    onNavigate("document-editor", { project })
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
                ← Назад
              </button>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-[15px] font-semibold text-gray-900">Документ клиента</DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">Создать или зарегистрировать документ по проекту клиента</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
          <div>
            <p className={SL}>Привязка к проекту</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Клиент</label>
                {initialClient ? (
                  <Input value={initialClient} readOnly className="h-[34px] text-[13px] bg-gray-50 text-gray-600" />
                ) : (
                  <>
                    <Select
                      value={client}
                      onValueChange={(v) => { setClient(v); setProject(""); clearError("client") }}
                    >
                      <SelectTrigger className={cn("h-[34px] text-[13px]", errors.client && ERR_RING)}>
                        <SelectValue placeholder="Выберите" />
                      </SelectTrigger>
                      <SelectContent>{CLIENT_NAMES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.client && <p className={ERR}>Обязательное поле</p>}
                  </>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Проект</label>
                {initialProject ? (
                  <Input value={initialProject} readOnly className="h-[34px] text-[13px] bg-gray-50 text-gray-600" />
                ) : (
                  <>
                    <Input
                      value={project}
                      onChange={(e) => { setProject(e.target.value); clearError("project") }}
                      placeholder="Введите код проекта"
                      className={cn("h-[34px] text-[13px]", errors.project && ERR_RING)}
                    />
                    {errors.project && <p className={ERR}>Обязательное поле</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className={SL}>Тип и параметры</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Тип документа</label>
                <Select value={docType} onValueChange={(v) => { setDocType(v); clearError("docType") }}>
                  <SelectTrigger className={cn("h-[34px] text-[13px]", errors.docType && ERR_RING)}>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>{DOC_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                {errors.docType && <p className={ERR}>Обязательное поле</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Плановая дата подписания</label>
                <Input
                  type="date"
                  value={signDate}
                  onChange={(e) => { setSignDate(e.target.value); clearError("signDate") }}
                  className={cn("h-[34px] text-[13px]", errors.signDate && ERR_RING)}
                />
                {errors.signDate && <p className={ERR}>Обязательное поле</p>}
              </div>
            </div>
          </div>

          <div>
            <p className={SL}>Генерация документа с помощью ИИ</p>
            <p className="text-[11px] text-blue-700 -mt-1.5 mb-2.5">
              ✦ Загрузите смету — ИИ сформирует приложение за 2 минуты
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
            <p className={SL}>Реквизиты документа</p>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Номер документа</label>
                <Input
                  value={docNum}
                  onChange={(e) => uploadState !== "idle" && setDocNum(e.target.value)}
                  readOnly={uploadState === "idle"}
                  placeholder={uploadState === "idle" ? "Заполнится автоматически после загрузки" : ""}
                  className={cn(
                    "h-[34px] text-[13px]",
                    uploadState === "idle" && "bg-gray-50 text-gray-400 cursor-not-allowed"
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">МенДО</label>
                <Select value={manager} onValueChange={(v) => { setManager(v); clearError("manager") }}>
                  <SelectTrigger className={cn("h-[34px] text-[13px]", errors.manager && ERR_RING)}>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>{MANAGERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                {errors.manager && <p className={ERR}>Обязательное поле</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Комментарий</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Условия, договорённости, контекст..."
                rows={3}
                className="text-[13px] resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                Например: «клиенту нужно два оригинала», «договорились перенести на 20-е», «ждём подписи директора». Сохраняется в карточке документа.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Отмена</Button>
          <Button size="sm" onClick={handleCreate}>Создать документ</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
