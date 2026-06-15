import { useState, useRef } from "react";
import { GripVertical, ChevronsUpDown, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DOC_COL_TEMPLATE, STATUS_BG, STATUS_COLORS, STATUSES } from "../constants";
import { fmt, isOverduePayment, overdueDays } from "../lib/docUtils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Doc } from "../types";
import { cn } from "@/lib/utils";

export default function SortableDocRow({
  doc,
  projectId,
  onStatusChange,
  onCommentChange,
}: {
  doc: Doc;
  projectId: number;
  onStatusChange: (pid: number, did: number, s: any) => void;
  onCommentChange: (pid: number, did: number, v: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `${projectId}-${doc.id}` });

  const paymentOverdue = isOverduePayment(doc);
  const days = overdueDays(doc);

  const [editComment, setEditComment] = useState(false);
  const [commentVal, setCommentVal] = useState(doc.comment);
  const commentRef = useRef<HTMLInputElement>(null);

  const commitComment = () => {
    setEditComment(false);
    onCommentChange(projectId, doc.id, commentVal);
  };
  const isApplication = doc.type === "Приложение";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, display: "grid", gridTemplateColumns: DOC_COL_TEMPLATE, alignItems: "center" }}
      className="group rounded-lg border border-transparent bg-white hover:border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <div className="pl-3 pr-1 py-2.5 w-10">
        <button
          className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex items-center justify-center"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
      <div className="px-3 py-2.5">
        <Badge variant="secondary" className="font-normal text-xs bg-gray-100 text-gray-700 whitespace-nowrap">
          {doc.type}
        </Badge>
      </div>
      <div className="px-3 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer whitespace-nowrap", STATUS_BG[doc.status])}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[doc.status] }} />
              {doc.status}
              <ChevronsUpDown className="w-3 h-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => onStatusChange(projectId, doc.id, s)} className={cn(doc.status === s && "font-semibold")}>
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS[s] }} />
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="px-3 py-2.5 text-right text-sm tabular-nums whitespace-nowrap">
        {doc.sum != null ? <span className="font-medium">{fmt(doc.sum)}</span> : <span className="text-gray-400">—</span>}
      </div>
      <div className="px-3 py-2.5">
        {doc.link ? (
          <button className="text-blue-600 hover:text-blue-800 text-sm hover:underline underline-offset-2 transition-colors" onClick={() => console.log("link", doc.link)}>
            {doc.link}
          </button>
        ) : <span className="text-gray-400">—</span>}
      </div>
      <div className="px-3 py-2.5 text-sm text-gray-600 whitespace-nowrap overflow-hidden">
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span>{doc.datePlan ?? "—"}</span>
          {paymentOverdue && days != null && (
            <span className="text-[11px] text-red-500">+{days} дн.</span>
          )}
        </div>
      </div>
      <div className="px-3 py-2.5 text-sm text-gray-600 whitespace-nowrap">{doc.dateFact ?? "—"}</div>
      <div className="px-3 py-2.5 text-sm text-gray-800">
        {isApplication ? (
          doc.estimate != null ? (
            <button className="text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center" onClick={() => console.log("open estimate", doc.id)}>
              <FileText className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-gray-400">—</span>
          )
        ) : null}
      </div>
      <div className="px-3 py-2.5 text-sm text-gray-600 max-w-[180px]">
        {editComment ? (
          <input
            ref={commentRef}
            className="w-full border border-blue-300 rounded px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            value={commentVal}
            onChange={(e) => setCommentVal(e.target.value)}
            onBlur={commitComment}
            onKeyDown={(e) => { if ((e as any).key === "Enter") commitComment(); }}
          />
        ) : (
          <span
            className="cursor-pointer hover:bg-gray-100 rounded px-1.5 py-0.5 -mx-1.5 inline-block min-h-[24px] min-w-[40px] transition-colors"
            onClick={() => { setCommentVal(doc.comment); setEditComment(true); setTimeout(() => commentRef.current?.focus(), 0); }}
          >
            {doc.comment || <span className="text-gray-300 italic">Добавить...</span>}
          </span>
        )}
      </div>
    </div>
  );
}
