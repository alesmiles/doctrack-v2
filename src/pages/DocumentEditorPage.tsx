import { useState, useRef } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IssueCard, type Issue } from "@/components/IssueCard"
import { DocumentBody } from "@/components/DocumentBody"

interface DocumentEditorPageProps {
  onBack: () => void
}

const ISSUES: Issue[] = [
  { id: "rim", type: "error", title: "Ad Format Breakdown Required", description: '"post / repost / story" — specify the count for each type out of 15 placements', formulation: "post — 10, repost — 3, story — 2" },
  { id: "period", type: "warning", title: "Period Too Broad", description: "Specify an exact period for delivery tracking", formulation: "March — May 2025" },
  { id: "acceptance", type: "error", title: "Acceptance Criteria Missing", description: "Without criteria the acceptance act can't be signed and the contractor can't be held accountable", formulation: "proof of publication + reach screenshot within 48 hours of posting" },
  { id: "content", type: "warning", title: "Content Approval", description: "Specify who approves content and how many hours before publishing", formulation: "48 hours before publishing; Client response time — 24 hours; silence = approval" },
]

const PROGRESS_W = ["w-0", "w-1/4", "w-1/2", "w-3/4", "w-full"] as const

export function DocumentEditorPage({ onBack }: DocumentEditorPageProps) {
  const [issues, setIssues] = useState<Issue[]>(ISSUES)
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
  const [resolvedTexts, setResolvedTexts] = useState<Map<string, string>>(new Map())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<HTMLDivElement>(null)

  const resolved = resolvedIds.size
  const total = issues.length
  const allDone = resolved === total

  function handleResolve(id: string, text: string) {
    setResolvedIds((prev) => new Set([...prev, id]))
    setResolvedTexts((prev) => new Map(prev).set(id, text))
    setExpandedId(null)
    setActiveId(null)
  }

  function handleCardToggle(id: string) {
    if (resolvedIds.has(id)) return
    const next = expandedId === id ? null : id
    setExpandedId(next)
    setActiveId(next)
    if (next) {
      docRef.current?.querySelector(`[data-issue-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  function handleMarkClick(id: string) {
    if (resolvedIds.has(id)) return
    setExpandedId(id)
    setActiveId(id)
    panelRef.current?.querySelector(`[data-issue-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  function handleDrop(fromId: string, toId: string) {
    if (!fromId || fromId === toId) return
    setIssues((prev) => {
      const arr = [...prev]
      const fi = arr.findIndex((i) => i.id === fromId)
      const ti = arr.findIndex((i) => i.id === toId)
      if (fi === -1 || ti === -1) return prev
      const [item] = arr.splice(fi, 1)
      arr.splice(ti, 0, item)
      return arr
    })
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </button>
          <span className="text-gray-200 select-none">|</span>
          <span className="text-sm font-medium text-gray-900">Annex ALF-9-03</span>
          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2.5 py-0.5">
            ✦ AI filled
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="h-[30px] px-3.5 text-xs font-medium border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50"
          >
            Preview
          </button>
          <div className="flex flex-col items-end">
            <span title={!allDone ? "Resolve all issues to export the document" : undefined}>
              <button
                onClick={() => allDone && toast("Document exported")}
                className={cn(
                  "h-[30px] px-3.5 text-xs font-medium rounded-md bg-blue-600 text-white border border-blue-600",
                  allDone ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                Export .docx
              </button>
            </span>
            {!allDone && (
              <p className="text-[10px] text-gray-400 text-right mt-1">
                Available after all issues are resolved
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div ref={docRef} className="flex-1 overflow-y-auto bg-stone-100 p-8">
          <DocumentBody
            resolvedIds={resolvedIds}
            resolvedTexts={resolvedTexts}
            activeMarkId={activeId}
            onMarkClick={handleMarkClick}
          />
        </div>

        <div className="w-[248px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="text-[13px] font-semibold text-gray-900">Issues</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {total - resolved > 0 ? `${total - resolved} need attention` : "All done"}
            </div>
          </div>

          <div ref={panelRef} className="flex-1 overflow-y-auto p-2.5">
            {issues.map((issue) => (
              <div key={issue.id} data-issue-id={issue.id}>
                {dragOverId === issue.id && draggingId !== issue.id && (
                  <div className="h-0.5 bg-blue-400 rounded-full mb-1 mx-1" />
                )}
                <IssueCard
                  issue={issue}
                  isActive={activeId === issue.id}
                  isResolved={resolvedIds.has(issue.id)}
                  isExpanded={expandedId === issue.id && !resolvedIds.has(issue.id)}
                  isDragging={draggingId === issue.id}
                  onToggle={() => handleCardToggle(issue.id)}
                  onResolve={handleResolve}
                  onDismiss={() => { setExpandedId(null); setActiveId(null) }}
                  onDragStart={(e) => { e.dataTransfer.setData("issueId", issue.id); setDraggingId(issue.id) }}
                  onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverId(issue.id) }}
                  onDrop={(e) => { e.preventDefault(); handleDrop(e.dataTransfer.getData("issueId"), issue.id) }}
                />
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
              <span>Progress</span>
              <span>{resolved} of {total}</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={cn("h-full bg-green-400 rounded-full transition-all duration-300", PROGRESS_W[resolved])} />
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-[680px] max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 flex-shrink-0">
              <span className="text-sm font-medium text-gray-900">Document Preview</span>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 bg-stone-100 p-8">
              <DocumentBody
                resolvedIds={resolvedIds}
                resolvedTexts={resolvedTexts}
                activeMarkId={null}
                onMarkClick={() => {}}
                previewMode
              />
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowPreview(false)}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md px-4 py-1.5 hover:bg-gray-50"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
