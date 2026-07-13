import { Clock, Link, Pencil } from "lucide-react";
import { KanbanDocument } from "@/mocks/kanbanMockData";

interface KanbanCardProps {
  document: KanbanDocument;
}

export const DOC_TYPE_BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  "Договор": { bg: "#DCFCE7", color: "#16A34A" },
  "Приложение": { bg: "#EBF2FF", color: "#2563EB" },
  "УПД": { bg: "#F3E8FF", color: "#7C3AED" },
  "Счёт": { bg: "#E0F2FE", color: "#0284C7" },
  "Акт": { bg: "#FEF3C7", color: "#D97706" },
  "СФ": { bg: "#F3F4F6", color: "#6B7280" },
};

export function KanbanCard({ document }: KanbanCardProps) {
  const docType = document.docType ?? document.type ?? "Приложение";
  const docNumber = document.docNumber ?? document.number ?? "";
  const clientName = document.clientName ?? document.client ?? "";
  const days = document.daysInStatus ?? document.daysInStage ?? 0;
  const isOverdue = typeof document.isOverdue === "boolean" ? document.isOverdue : days > 5;
  const hasEdits = typeof document.hasEdits === "boolean" ? document.hasEdits : !!document.hasRevisions;
  const linkedAppNumber = document.linkedAppNumber ?? null;

  const badgeStyle = DOC_TYPE_BADGE_STYLES[docType] ?? DOC_TYPE_BADGE_STYLES["Приложение"];

  const showBottomRow = !!linkedAppNumber;
  const showInlineEdits = !linkedAppNumber && hasEdits;

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
        <span style={{ background: badgeStyle.bg, color: badgeStyle.color, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, display: "inline-block" }}>
          {docType}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 4, color: isOverdue ? "#EF4444" : "#9CA3AF", fontSize: 11, fontWeight: isOverdue ? 600 : 400 }}>
          <Clock size={13} />
          <span>{days} дн.</span>
        </div>
      </div>

      <div style={{ marginBottom: showBottomRow ? 8 : 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 2 }}>{clientName}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11.5, fontWeight: 500, color: "#6B7280", lineHeight: 1.3 }}>{docType} №{docNumber}</span>
          {showInlineEdits && (
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Pencil size={10} color="#9CA3AF" />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF" }}>правки</span>
            </div>
          )}
        </div>
      </div>

      {showBottomRow && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Link size={12} color="#B0B7C3" />
          <span style={{ fontSize: 11.5, color: "#B0B7C3" }}>к Приложению {linkedAppNumber}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {hasEdits ? (
            <>
              <Pencil size={10} color="#9CA3AF" />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF" }}>правки</span>
            </>
          ) : (
            <span />
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default KanbanCard;
