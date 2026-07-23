import { useCallback, useRef } from "react";
import { SoglasovanieKanbanCard } from "@/components/SoglasovanieKanbanCard";
import { DocStage, SoglasovanieDocument } from "@/data/soglasovanie-seed";

interface Stage {
  key: DocStage;
  title: string;
  documents: SoglasovanieDocument[];
}

interface SoglasovanieKanbanStageGroupProps {
  stages: Stage[];
  onCardClick: (document: SoglasovanieDocument) => void;
}

// Компактная ширина колонки (уже 300px исходного варианта — D1 «5 колонок на
// 1440px без горизонтального скролла»); minmax(N, 1fr) даёт колонкам расти на
// широких экранах и включает горизонтальный скролл контейнера, если даже на
// минимуме 5 колонок не помещаются (узкие экраны).
const MIN_COLUMN_WIDTH = 176;
const gridTemplateColumns = (count: number) => `repeat(${count}, minmax(${MIN_COLUMN_WIDTH}px, 1fr))`;

export function SoglasovanieKanbanStageGroup({ stages, onCardClick }: SoglasovanieKanbanStageGroupProps) {
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
        <div
          ref={headerScrollRef}
          className="grid gap-4"
          style={{ gridTemplateColumns: gridTemplateColumns(stages.length), overflowX: "hidden" }}
        >
          {stages.map((stage, idx) => (
            <div
              key={stage.key}
              data-stage={stage.key}
              className={idx < stages.length - 1 ? "border-r border-gray-200" : ""}
              style={{ background: "#F9FAFB", borderRadius: "10px 10px 0 0", padding: "10px 12px 8px" }}
            >
              <div style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{stage.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        ref={bodyScrollRef}
        onScroll={syncHeaderScroll}
        className="grid gap-4 overflow-x-auto pb-2"
        style={{ gridTemplateColumns: gridTemplateColumns(stages.length) }}
      >
        {stages.map((stage, idx) => (
          <div
            key={stage.key}
            data-stage={stage.key}
            className={idx < stages.length - 1 ? "flex flex-col gap-3 border-r border-gray-200" : "flex flex-col gap-3"}
            style={{ background: "#F9FAFB", borderRadius: "0 0 10px 10px", padding: "0 12px 12px", minHeight: 8 }}
          >
            {stage.documents.map((document) => (
              <SoglasovanieKanbanCard key={document.id} document={document} onClick={onCardClick} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SoglasovanieKanbanStageGroup;
