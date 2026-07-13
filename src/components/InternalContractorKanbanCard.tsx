import { Clock, Link, Pencil } from "lucide-react";
import { InternalContractorKanbanDocument } from "@/mocks/internalContractorsMockData";
import { DOC_TYPE_BADGE_STYLES } from "@/components/KanbanCard";

interface InternalContractorKanbanCardProps {
  document: InternalContractorKanbanDocument;
}

export function InternalContractorKanbanCard({ document }: InternalContractorKanbanCardProps) {
  const docType = document.docType;
  const docNumber = document.docNumber;
  const contractorName = document.contractorName;
  const direction = document.direction ?? "—";
  const days = document.daysInStatus;
  const isOverdue = typeof document.isOverdue === "boolean" ? document.isOverdue : days > 5;
  const hasEdits = !!document.hasEdits;
  const linkedAppNumber = document.linkedAppNumber ?? null;

  const badgeStyle = DOC_TYPE_BADGE_STYLES[docType] ?? DOC_TYPE_BADGE_STYLES["Приложение"];

  const showLink = !!linkedAppNumber && docType !== "УПД";

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

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 2 }}>{contractorName}</div>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: "#6B7280", lineHeight: 1.3 }}>{docType} №{docNumber}</span>
      </div>

      {showLink && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <Link size={12} color="#B0B7C3" />
          <span style={{ fontSize: 11.5, color: "#B0B7C3" }}>к Приложению {linkedAppNumber}</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: "#6B7280" }}>
          Направление: <span style={{ fontWeight: 600, color: "#111827" }}>{direction}</span>
        </span>

        {hasEdits && (
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Pencil size={10} color="#9CA3AF" />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF" }}>правки</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default InternalContractorKanbanCard;
