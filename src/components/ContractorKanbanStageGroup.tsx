import { useCallback, useRef } from "react";
import { ContractorKanbanCard } from "@/components/ContractorKanbanCard";
import { ContractorKanbanDocument, ContractorKanbanStageKey } from "@/mocks/contractorsKanbanMockData";

interface Stage {
  key: ContractorKanbanStageKey;
  title: string;
  documents: ContractorKanbanDocument[];
}

interface ContractorKanbanStageGroupProps {
  stages: Stage[];
}

const COLUMN_WIDTH = 300;

export function ContractorKanbanStageGroup({ stages }: ContractorKanbanStageGroupProps) {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  const syncHeaderScroll = useCallback(() => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  }, []);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white">
        <div ref={headerScrollRef} className="flex gap-4" style={{ overflowX: "hidden" }}>
          {stages.map((stage) => (
            <div
              key={stage.key}
              className="flex-shrink-0"
              style={{ width: COLUMN_WIDTH, background: "#F9FAFB", borderRadius: "10px 10px 0 0", padding: "10px 12px 8px" }}
            >
              <div className="flex items-center justify-between" style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{stage.title}</span>
                <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 400 }}>{stage.documents.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div ref={bodyScrollRef} onScroll={syncHeaderScroll} className="flex gap-4 overflow-x-auto pb-2">
        {stages.map((stage) => (
          <div
            key={stage.key}
            className="flex-shrink-0 flex flex-col gap-3"
            style={{ width: COLUMN_WIDTH, background: "#F9FAFB", borderRadius: "0 0 10px 10px", padding: "0 12px 12px" }}
          >
            {stage.documents.map((document) => (
              <ContractorKanbanCard key={document.id} document={document} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContractorKanbanStageGroup;
