import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CreateVendorDocModalProps {
  open: boolean
  onClose: () => void
}

type Mode = "project" | "expense"

const VENDORS = ["Blogger Agency", "MediaBuy LLC", "Print Studio"]
const PROJECTS = ["ALF-9 · March 2025", "ALF-10 · April 2025"]
const DOC_TYPES = ["Contract", "Invoice", "Act", "Annex", "UPD"]
const STATUSES = ["Not Created", "Under Review", "Sent EDO", "Signed EDO", "Signed ORIG", "Rejected"]
const MANAGERS = ["Inna Mikhrabova", "Dmitry Larin"]
const CATEGORIES = ["Rent", "Software", "Office Supplies", "Other"]

const SL = "text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2.5"

export function CreateVendorDocModal({ open, onClose }: CreateVendorDocModalProps) {
  const [mode, setMode] = useState<Mode>("project")
  const [vendor, setVendor] = useState("")
  const [project, setProject] = useState("")
  const [docType, setDocType] = useState("")
  const [amount, setAmount] = useState("")
  const [signDate, setSignDate] = useState("")
  const [status, setStatus] = useState("")
  const [docNum, setDocNum] = useState("")
  const [responsible, setResponsible] = useState("")
  const [docLink, setDocLink] = useState("")
  const [comment, setComment] = useState("")
  const [category, setCategory] = useState("")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-[15px] font-semibold text-gray-900">Vendor Document</DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">Create or register a document for a vendor project</p>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
          <div className="bg-gray-100 rounded-lg p-0.5 flex">
            {(["project", "expense"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                  mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {m === "project" ? "Project Vendor" : "Off-Project Expenses"}
              </button>
            ))}
          </div>

          {mode === "project" && (
            <div>
              <p className={SL}>Vendor &amp; Project</p>
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Vendor</label>
                  <Select value={vendor} onValueChange={setVendor}>
                    <SelectTrigger className="h-[34px] text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{VENDORS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Project Link</label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="h-[34px] text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{PROJECTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 text-[11px] text-gray-600">
                Client document: Annex ALF-9-03 · Not signed — verify status before payment
              </div>
            </div>
          )}

          {mode === "expense" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Expense Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-[34px] text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div>
            <p className={SL}>Type &amp; Parameters</p>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Document Type</label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="h-[34px] text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DOC_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Amount, ₽</label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-[34px] text-[13px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Planned Signing Date</label>
                <Input type="date" value={signDate} onChange={(e) => setSignDate(e.target.value)} className="h-[34px] text-[13px]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-[34px] text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Document Number</label>
                <Input value={docNum} onChange={(e) => setDocNum(e.target.value)} className="h-[34px] text-[13px]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Responsible</label>
                <Select value={responsible} onValueChange={setResponsible}>
                  <SelectTrigger className="h-[34px] text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{MANAGERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-2.5">
              <label className="text-xs text-gray-500">Document Link</label>
              <Input value={docLink} onChange={(e) => setDocLink(e.target.value)} className="h-[34px] text-[13px]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Comment</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="text-[13px] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={onClose}>Create Document</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
