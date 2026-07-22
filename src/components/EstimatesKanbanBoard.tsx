import { useMemo } from "react";
import { EstimatesKanbanStageGroup } from "@/components/EstimatesKanbanStageGroup";
import { ESTIMATE_STATUS_COLORS } from "@/components/EstimatesKanbanCard";
import { Estimate, EstimateStatus } from "@/types";

const ESTIMATE_STATUSES: EstimateStatus[] = ["На согласовании", "Требует правок", "Согласована", "Отклонена"];

interface EstimatesKanbanBoardProps {
  estimates: Estimate[];
  groupByClient?: boolean;
}

export function EstimatesKanbanBoard({ estimates, groupByClient = false }: EstimatesKanbanBoardProps) {
  const groups = useMemo(() => {
    if (!groupByClient) {
      return [{ key: "all", title: "", estimates }];
    }

    const grouped = new Map<string, Estimate[]>();
    estimates.forEach((e) => {
      const existing = grouped.get(e.client) ?? [];
      existing.push(e);
      grouped.set(e.client, existing);
    });

    return Array.from(grouped.entries()).map(([key, ests]) => ({ key, title: key, estimates: ests }));
  }, [estimates, groupByClient]);

  return (
    <div className="px-8 pb-8">
      {estimates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
          По выбранным фильтрам смет не найдено.
        </div>
      ) : (
        <div className="pb-2">
          {groups.map((group) => {
            const stages = ESTIMATE_STATUSES.map((status) => ({
              key: status,
              title: status,
              color: ESTIMATE_STATUS_COLORS[status],
              estimates: group.estimates.filter((e) => e.status === status),
            }));

            return (
              <div key={group.key} className="mb-6">
                {groupByClient && (
                  <div className="mb-3 text-sm font-semibold text-gray-700">{group.title}</div>
                )}
                <EstimatesKanbanStageGroup stages={stages} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EstimatesKanbanBoard;
