import { useMemo } from "react";
import { InternalContractorKanbanStageGroup } from "@/components/InternalContractorKanbanStageGroup";
import { internalContractorKanbanDocuments, INTERNAL_CONTRACTOR_KANBAN_STAGES, InternalContractorKanbanDocument } from "@/mocks/internalContractorsMockData";

interface InternalContractorKanbanBoardProps {
  search: string;
  contractorFilter: string;
  responsibleFilter: string;
  typeFilter: string;
  directionFilter: string;
  doManagerFilter: string;
  showOverdueOnly: boolean;
  groupByDirection: boolean;
}

export function InternalContractorKanbanBoard({
  search,
  contractorFilter,
  responsibleFilter,
  typeFilter,
  directionFilter,
  doManagerFilter,
  showOverdueOnly,
  groupByDirection,
}: InternalContractorKanbanBoardProps) {
  const filteredDocuments = useMemo(() => {
    return internalContractorKanbanDocuments.filter((doc) => {
      const s = search.toLowerCase();
      const values = [doc.docType, doc.docNumber, doc.contractorName, doc.direction ?? "", doc.responsibleName ?? "", doc.doManagerName ?? ""];
      const matchesSearch = !search || values.some((value) => String(value).toLowerCase().includes(s));
      const matchesContractor = !contractorFilter || doc.contractorName === contractorFilter;
      const matchesResponsible = !responsibleFilter || doc.responsibleName === responsibleFilter;
      const matchesType = !typeFilter || doc.docType === typeFilter;
      const matchesDirection = !directionFilter || doc.direction === directionFilter;
      const matchesDoManager = !doManagerFilter || doc.doManagerName === doManagerFilter;
      const isOverdue = typeof doc.isOverdue === "boolean" ? doc.isOverdue : doc.daysInStatus > 5;
      const matchesOverdue = !showOverdueOnly || isOverdue;
      return matchesSearch && matchesContractor && matchesResponsible && matchesType && matchesDirection && matchesDoManager && matchesOverdue;
    });
  }, [search, contractorFilter, responsibleFilter, typeFilter, directionFilter, doManagerFilter, showOverdueOnly]);

  const groups = useMemo(() => {
    if (!groupByDirection) {
      return [{ key: "all", title: "Все документы", documents: filteredDocuments }];
    }

    const grouped = new Map<string, InternalContractorKanbanDocument[]>();
    filteredDocuments.forEach((doc) => {
      const key = doc.direction ?? "—";
      const existing = grouped.get(key) ?? [];
      existing.push(doc);
      grouped.set(key, existing);
    });

    return Array.from(grouped.entries()).map(([key, docs]) => ({ key, title: key, documents: docs }));
  }, [filteredDocuments, groupByDirection]);

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
            const groupedByStage = INTERNAL_CONTRACTOR_KANBAN_STAGES.map((stage) => ({
              ...stage,
              documents: groupDocs.filter((doc) => doc.stage === stage.key),
            }));

            return (
              <div key={group.key} className="mb-6">
                {groupByDirection && (
                  <div className="mb-3 text-sm font-semibold text-gray-700">{group.title}</div>
                )}
                <InternalContractorKanbanStageGroup stages={groupedByStage} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InternalContractorKanbanBoard;
