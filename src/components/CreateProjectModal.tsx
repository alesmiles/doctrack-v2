import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onOpenCreateDoc?: (client: string, project: string, managerDO: string) => void
}

const CLIENTS = ["Alpha Media", "Tutu.ru", "SberMarket", "Yandex"]
const DIRECTIONS = ["Influence", "Media Buying", "SMM", "Content", "Development", "PR"]
const KAMS = ["Anna Smirnova", "Boris Koval", "Maria Kim"]
const MANAGERS = ["Inna Mikhrabova", "Dmitry Larin"]
const EXISTING_COUNTS: Record<string, number> = {
  "Alpha Media": 2,
  "Yandex": 1,
  "Tutu.ru": 0,
  "SberMarket": 0,
}

const CLIENT_PREFIX_MAP: Record<string, string> = {
  "Alpha Media": "ALF",
  "Yandex": "YAN",
  "Tutu.ru": "TUT",
  "SberMarket": "SBR",
}

function generateCode(client: string): string {
  const prefix = CLIENT_PREFIX_MAP[client] ?? "CLI"
  const count = EXISTING_COUNTS[client] ?? 0
  return `${prefix}-${count + 1}`
}

const DOC_TYPES = [
  { id: "contract", label: "Contract / Order", badge: "required", req: true, disabled: true, on: true },
  { id: "appendix", label: "Annex / Estimate", badge: "required", req: true, disabled: true, on: true },
  { id: "invoice", label: "Invoice", badge: "default", req: false, disabled: false, on: true },
  { id: "act", label: "Acceptance Act", badge: "default", req: false, disabled: false, on: true },
  { id: "ds", label: "Addendum", badge: "", req: false, disabled: false, on: false },
  { id: "upd", label: "UPD", badge: "", req: false, disabled: false, on: false },
]

export function CreateProjectModal({ open, onClose, onOpenCreateDoc }: CreateProjectModalProps) {
  const [clientId, setClientId] = useState("")
  const [projectCode, setProjectCode] = useState("")
  const [projectName, setProjectName] = useState("")
  const [direction, setDirection] = useState("")
  const [kam, setKam] = useState("")
  const [managerDO, setManagerDO] = useState("")
  const [checked, setChecked] = useState<Set<string>>(
    new Set(DOC_TYPES.filter((d) => d.on).map((d) => d.id))
  )

  const revealed = clientId !== "" && projectCode !== ""
  const canCreate = clientId !== "" && projectCode !== ""

  function handleClientChange(value: string) {
    setClientId(value)
    setProjectCode(generateCode(value))
  }

  function toggleDoc(id: string) {
    setChecked((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-[15px] font-semibold text-gray-900">New Project</DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">Create a project card — the foundation for document workflow</p>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2.5">Client &amp; Project</p>
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Client *</label>
              <Select value={clientId} onValueChange={handleClientChange}>
                <SelectTrigger className="h-[34px] text-[13px]">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Project Code *</label>
              <Input
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="ALF-9"
                className="h-[34px] text-[13px]"
              />
            </div>
          </div>

          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            revealed ? "max-h-[800px]" : "max-h-0"
          )}>
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Project Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Influence Campaign March 2025"
                  className="h-[34px] text-[13px]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Service Line</label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger className="h-[34px] text-[13px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-1">Team</p>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">KAM</label>
                  <Select value={kam} onValueChange={setKam}>
                    <SelectTrigger className="h-[34px] text-[13px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {KAMS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Doc Manager</label>
                  <Select value={managerDO} onValueChange={setManagerDO}>
                    <SelectTrigger className="h-[34px] text-[13px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANAGERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-1">Default Documents</p>
              <p className="text-[11px] text-gray-400 -mt-1.5">Will be added to the project automatically</p>
              <div className="flex flex-col gap-1">
                {DOC_TYPES.map((dt) => (
                  <div key={dt.id} className="flex items-center gap-2.5 py-1.5 px-2.5 border border-gray-100 rounded-md bg-gray-50">
                    <Checkbox
                      id={dt.id}
                      checked={checked.has(dt.id)}
                      disabled={dt.disabled}
                      onCheckedChange={() => toggleDoc(dt.id)}
                    />
                    <label htmlFor={dt.id} className={cn("text-xs text-gray-700 flex-1", !dt.disabled && "cursor-pointer")}>
                      {dt.label}
                    </label>
                    {dt.badge && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full border",
                        dt.req ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {dt.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="outline" size="sm" onClick={onClose}>Done</Button>
          <Button
            size="sm"
            disabled={!canCreate}
            onClick={() => {
              if (!canCreate) return
              onClose()
              onOpenCreateDoc?.(clientId, projectCode, managerDO)
            }}
          >
            Create Document →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
