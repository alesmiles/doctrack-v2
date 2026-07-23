import { Estimate, EstimateStatus } from "@/types";
import { fmt } from "@/lib/docUtils";
import { cn } from "@/lib/utils";

interface EstimatesKanbanCardProps {
  estimate: Estimate;
}

export const ESTIMATE_STATUS_COLORS: Record<EstimateStatus, string> = {
  "На согласовании": "#3B82F6",
  "Требует правок": "#F59E0B",
  "Согласована": "#10B981",
  "Отклонена": "#EF4444",
};

export function EstimatesKanbanCard({ estimate }: EstimatesKanbanCardProps) {
  return (
    <div
      className="bg-white cursor-pointer transition-shadow hover:shadow-[0_3px_12px_rgba(0,0,0,0.09)]"
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: 10,
        padding: 12,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ background: "#E0F2FE", color: "#0284C7", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, display: "inline-block" }}>
          Смета
        </span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{estimate.createdAt}</span>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 2 }}>
          {estimate.client}
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: "#6B7280", lineHeight: 1.3 }}>{estimate.project}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0", estimate.responsible.color)}>
            {estimate.responsible.initials}
          </div>
          <span className="text-sm text-gray-600 truncate">{estimate.responsible.name}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{fmt(estimate.sum)}</span>
      </div>
    </div>
  );
}

export default EstimatesKanbanCard;
