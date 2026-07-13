import { useMemo } from "react";
import { ContractorKanbanStageGroup } from "@/components/ContractorKanbanStageGroup";
import { contractorKanbanDocuments, CONTRACTOR_KANBAN_STAGES, ContractorKanbanDocument } from "@/mocks/contractorsKanbanMockData";

interface ContractorKanbanBoardProps {
  search: string;
  clientFilter: string;
  contractorFilter: string;
  responsibleFilter: string;
  typeFilter: string;
  directionFilter: string;
  doManagerFilter: string;
  showOverdueOnly: boolean;
  groupByProject: boolean;
}

export function ContractorKanbanBoard({
  search,
  clientFilter,
  contractorFilter,
  responsibleFilter,
  typeFilter,
  directionFilter,
  doManagerFilter,
  showOverdueOnly,
  groupByProject,
}: ContractorKanbanBoardProps) {
  const filteredDocuments = useMemo(() => {
    return contractorKanbanDocuments.filter((doc) => {
      const s = search.toLowerCase();
      const values = [doc.docType, doc.docNumber, doc.contractorName, doc.clientName ?? "", doc.projectCode, doc.responsibleName ?? "", doc.doManagerName ?? ""];
      const matchesSearch = !search || values.some((value) => String(value).toLowerCase().includes(s));
      const matchesClient = !clientFilter || (doc.clientName ?? "") === clientFilter;
      const matchesContractor = !contractorFilter || doc.contractorName === contractorFilter;
      const matchesResponsible = !responsibleFilter || doc.responsibleName === responsibleFilter;
      const matchesType = !typeFilter || doc.docType === typeFilter;
      const matchesDirection = !directionFilter || doc.direction === directionFilter;
      const matchesDoManager = !doManagerFilter || doc.doManagerName === doManagerFilter;
      const isOverdue = typeof doc.isOverdue === "boolean" ? doc.isOverdue : doc.daysInStatus > 5;
      const matchesOverdue = !showOverdueOnly || isOverdue;
      return matchesSearch && matchesClient && matchesContractor && matchesResponsible && matchesType && matchesDirection && matchesDoManager && matchesOverdue;
    });
  }, [search, clientFilter, contractorFilter, responsibleFilter, typeFilter, directionFilter, doManagerFilter, showOverdueOnly]);

  const groups = useMemo(() => {
    if (!groupByProject) {
      return [{ key: "all", title: "Все документы", documents: filteredDocuments }];
    }

    const grouped = new Map<string, ContractorKanbanDocument[]>();
    filteredDocuments.forEach((doc) => {
      const key = `${doc.clientName ?? "—"} · ${doc.projectCode}`;
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
            const groupedByStage = CONTRACTOR_KANBAN_STAGES.map((stage) => ({
              ...stage,
              documents: groupDocs.filter((doc) => doc.stage === stage.key),
            }));

            return (
              <div key={group.key} className="mb-6">
                {groupByProject && (
                  <div className="mb-3 text-sm font-semibold text-gray-700">{group.title}</div>
                )}
                <ContractorKanbanStageGroup stages={groupedByStage} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ContractorKanbanBoard;
