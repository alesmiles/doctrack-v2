import { useMemo } from "react";
import { SoglasovanieKanbanStageGroup } from "@/components/SoglasovanieKanbanStageGroup";
import {
  DOC_STAGE_ORDER,
  DOC_STAGE_LABELS,
  DocDirection,
  SoglasovanieDocument,
  SoglasovanieGroupBy,
  getSwimlaneKeyAndTitle,
} from "@/data/soglasovanie-seed";

interface SoglasovanieKanbanBoardProps {
  direction: DocDirection;
  documents: SoglasovanieDocument[];
  groupBy: SoglasovanieGroupBy;
  onCardClick: (document: SoglasovanieDocument) => void;
}

export function SoglasovanieKanbanBoard({ direction, documents, groupBy, onCardClick }: SoglasovanieKanbanBoardProps) {
  const swimlanes = useMemo(() => {
    const grouped = new Map<string, { title: string; documents: SoglasovanieDocument[] }>();
    documents.forEach((doc) => {
      const { key, title } = getSwimlaneKeyAndTitle(doc, groupBy);
      const existing = grouped.get(key);
      if (existing) {
        existing.documents.push(doc);
      } else {
        grouped.set(key, { title, documents: [doc] });
      }
    });
    return Array.from(grouped.values());
  }, [documents, groupBy]);

  const stageLabels = DOC_STAGE_LABELS[direction];

  return (
    <div className="px-8 pb-8">
      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
          По выбранным фильтрам документов не найдено.
        </div>
      ) : (
        <div className="pb-2">
          {swimlanes.map((lane, idx) => {
            const groupedByStage = DOC_STAGE_ORDER.map((stage) => ({
              key: stage,
              title: stageLabels[stage],
              documents: lane.documents.filter((doc) => doc.stage === stage),
            }));

            return (
              <div key={`${lane.title}-${idx}`} className="mb-6">
                <div className="mb-3 text-sm font-semibold text-gray-700">{lane.title}</div>
                <SoglasovanieKanbanStageGroup stages={groupedByStage} onCardClick={onCardClick} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SoglasovanieKanbanBoard;
