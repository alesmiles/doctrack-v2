import { getInitials } from "@/lib/utils";
import type { Person } from "./types";

interface ResponsibleColumnCellProps {
  people: Person[];
}

export function ResponsibleColumnCell({ people }: ResponsibleColumnCellProps) {
  if (people.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  const primary = people.find((p) => p.isPrimary) ?? people[0];
  const extra = people.length - 1;

  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
        {getInitials(primary.fullName)}
      </div>
      <span className="text-sm text-gray-800 truncate">{primary.fullName || "Без имени"}</span>
      {extra > 0 && (
        <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 font-medium flex-shrink-0">
          +{extra}
        </span>
      )}
    </div>
  );
}
