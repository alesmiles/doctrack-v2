import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SoglasovanieDocument, DEFAULT_AUTO_HIDE_DAYS, getContragentName } from "@/data/soglasovanie-seed";

interface SoglasovanieKanbanCardProps {
  document: SoglasovanieDocument;
  onClick: (document: SoglasovanieDocument) => void;
}

export function SoglasovanieKanbanCard({ document, onClick }: SoglasovanieKanbanCardProps) {
  const contragentName = getContragentName(document);
  const isOverdue = document.overdueByDays > 0;
  const isSigned = document.stage === "signed";
  const autoHideInDays = document.autoHideInDays ?? DEFAULT_AUTO_HIDE_DAYS;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(document)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(document); }}
      className={cn(
        "flex w-full cursor-pointer flex-col rounded-[10px] border border-gray-200 bg-white p-3 text-left transition-shadow hover:shadow-[0_3px_12px_rgba(0,0,0,0.09)]",
        isSigned && "opacity-70"
      )}
    >
      <div className="mb-1 text-[15px] font-bold leading-tight tracking-tight text-gray-900">{document.name}</div>

      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-[12px] font-medium text-gray-500">{contragentName}</span>
        {isSigned ? (
          <span className="flex-shrink-0 text-[11px] text-gray-400">снимется через {autoHideInDays} дн.</span>
        ) : (
          <div className={cn("flex flex-shrink-0 items-center gap-1 text-[11px]", isOverdue ? "font-semibold text-red-500" : "text-gray-400")}>
            <Clock size={13} />
            <span>{isOverdue ? `+${document.overdueByDays}` : document.daysInStage} дн.</span>
          </div>
        )}
      </div>

      <div className="text-[11px] font-medium text-gray-500">
        v{document.version}{document.channel === "edo" ? " · ЭДО" : ""}
      </div>
    </div>
  );
}

export default SoglasovanieKanbanCard;
