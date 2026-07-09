import { useMemo } from "react";
import { KanbanStageGroup } from "@/components/KanbanStageGroup";
import { kanbanMockDocuments, KANBAN_STAGES, KanbanDocument } from "@/mocks/kanbanMockData";

interface KanbanBoardProps {
  search: string;
  clientFilter: string;
  kamFilter: string;
  menDoFilter: string;
  typeFilter: string;
  directionFilter: string;
  monthFilter: string;
  showOverdueOnly: boolean;
  groupByProject: boolean;
}

export function KanbanBoard({
  search,
  clientFilter,
  kamFilter,
  menDoFilter,
  typeFilter,
  directionFilter,
  monthFilter,
  showOverdueOnly,
  groupByProject,
}: KanbanBoardProps) {
  const filteredDocuments = useMemo(() => {
    return kanbanMockDocuments.filter((doc) => {
      const s = search.toLowerCase();
      const values = [
        (doc.docType ?? doc.type ?? ""),
        (doc.docNumber ?? doc.number ?? ""),
        (doc.clientName ?? doc.client ?? ""),
        (doc.projectCode ?? ""),
        (typeof (doc as any).kam === "string" ? (doc as any).kam : ((doc as any).kam?.name ?? "")),
        (typeof (doc as any).menDO === "string" ? (doc as any).menDO : ((doc as any).menDO?.name ?? "")),
      ];
      const matchesSearch = !search || values.some((value) => String(value).toLowerCase().includes(s));
      const matchesClient = !clientFilter || (doc.clientName ?? doc.client) === clientFilter;
      const matchesKam = !kamFilter || ((typeof (doc as any).kam === "string" ? (doc as any).kam : ((doc as any).kam?.name ?? "")) === kamFilter);
      const matchesMenDo = !menDoFilter || ((typeof (doc as any).menDO === "string" ? (doc as any).menDO : ((doc as any).menDO?.name ?? "")) === menDoFilter);
      const matchesType = !typeFilter || (doc.docType ?? doc.type) === typeFilter;
      const matchesDirection = !directionFilter || (doc.direction ?? "") === directionFilter;
      const matchesMonth = !monthFilter || (doc.month ?? "") === monthFilter;
      const days = typeof doc.daysInStatus === "number" ? doc.daysInStatus : (doc.daysInStage ?? 0);
      const matchesOverdue = !showOverdueOnly || (doc.isOverdue ?? (days > 5));
      return matchesSearch && matchesClient && matchesKam && matchesMenDo && matchesType && matchesDirection && matchesMonth && matchesOverdue;
    });
  }, [search, clientFilter, kamFilter, menDoFilter, typeFilter, directionFilter, monthFilter, showOverdueOnly]);

  const groups = useMemo(() => {
    if (!groupByProject) {
      return [{ key: "all", title: "Все документы", documents: filteredDocuments }];
    }

    const grouped = new Map<string, KanbanDocument[]>();
    filteredDocuments.forEach((doc) => {
      const clientName = doc.clientName ?? doc.client ?? "Unknown";
      const key = `${clientName} · ${doc.projectCode}`;
      const existing = grouped.get(key) ?? [];
      existing.push(doc);
      grouped.set(key, existing);
    });

    return Array.from(grouped.entries()).map(([key, docs]) => ({ key, title: key, documents: docs }));
  }, [filteredDocuments, groupByProject]);

  return (
    <div className="px-8 pb-8">
      {filteredDocuments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
          По выбранным фильтрам документов не найдено.
        </div>
      ) : (
        <div className="pb-2">
          {groups.map((group) => {
            const groupDocs = group.documents;
            const groupedByStage = KANBAN_STAGES.map((stage) => ({
              ...stage,
              documents: groupDocs.filter((doc) => doc.stage === stage.key),
            }));

            return (
              <div key={group.key} className="mb-6">
                {groupByProject && (
                  <div className="mb-3 text-sm font-semibold text-gray-700">{group.title}</div>
                )}
                <KanbanStageGroup stages={groupedByStage} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;
