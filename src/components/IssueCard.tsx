import { useState, useRef } from "react"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Issue {
  id: string
  type: "error" | "warning"
  title: string
  description: string
  formulation: string
}

interface IssueCardProps {
  issue: Issue
  isActive: boolean
  isResolved: boolean
  isExpanded: boolean
  isDragging: boolean
  onToggle: () => void
  onResolve: (issueId: string, text: string) => void
  onDismiss: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export function IssueCard({
  issue, isActive, isResolved, isExpanded, isDragging,
  onToggle, onResolve, onDismiss, onDragStart, onDragEnd, onDragOver, onDrop,
}: IssueCardProps) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(issue.formulation)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const dot = isResolved ? "bg-green-400" : issue.type === "error" ? "bg-red-400" : "bg-amber-400"

  function handleAccept(text: string) {
    setEditing(false)
    onResolve(issue.id, text)
  }

  function handleEdit() {
    setEditing(true)
    setEditText(issue.formulation)
    setTimeout(() => taRef.current?.focus(), 50)
  }

  function handleCancelEdit() {
    setEditing(false)
    setEditText(issue.formulation)
  }

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden mb-1.5 group transition-opacity",
        isActive ? "border-blue-300 bg-blue-50/30" : "border-gray-100",
        isResolved && "opacity-60",
        isDragging && "opacity-40"
      )}
      draggable={!isResolved}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        className="flex items-center gap-2 p-2.5 px-3 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <GripVertical
          className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        />
        <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dot)} />
        <span className={cn("text-xs text-gray-700 flex-1", isResolved && "line-through")}>{issue.title}</span>
        <span className={cn("text-[10px] text-gray-400 transition-transform duration-150 inline-block", isExpanded && "rotate-90")}>›</span>
      </div>

      {isExpanded && !isResolved && (
        <div className="px-3 pb-3">
          <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{issue.description}</p>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Suggested text</p>

          {!editing ? (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 text-[11px] text-gray-700 mb-3 leading-relaxed">
                {issue.formulation}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleAccept(issue.formulation)}
                  className="bg-blue-600 text-white text-[11px] rounded-md px-3 py-1.5 hover:bg-blue-700"
                >
                  Accept
                </button>
                <button
                  onClick={handleEdit}
                  className="border border-gray-200 text-gray-600 text-[11px] rounded-md px-3 py-1.5 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={onDismiss}
                  className="text-gray-400 text-[11px] px-2 py-1.5 hover:text-gray-600"
                >
                  Dismiss
                </button>
              </div>
            </>
          ) : (
            <>
              <textarea
                ref={taRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                placeholder="Enter custom value..."
                className="w-full text-[11px] border border-blue-300 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 mb-3"
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAccept(editText)}
                  className="bg-blue-600 text-white text-[11px] rounded-md px-3 py-1.5 hover:bg-blue-700"
                >
                  Apply edit
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 text-[11px] px-2 py-1.5 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
