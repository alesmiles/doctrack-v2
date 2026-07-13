import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableLegalEntityProps {
  entities: string[];
  interactive?: boolean;
}

export function ExpandableLegalEntity({ entities, interactive = true }: ExpandableLegalEntityProps) {
  const [expanded, setExpanded] = useState(false);

  if (entities.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  if (entities.length === 1) {
    return <span className="text-sm text-gray-800 truncate">{entities[0]}</span>;
  }

  const summary = `${entities.length} юрлица`;

  if (!interactive) {
    return <span className="text-sm text-gray-800">{summary}</span>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className="flex items-center gap-1 text-sm text-gray-800 hover:text-blue-700 transition-colors"
      >
        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-90")} />
        {summary}
      </button>
      {expanded && (
        <div className="mt-1.5 flex flex-col gap-1 pl-5">
          {entities.map((entity) => (
            <span key={entity} className="text-sm text-gray-600">
              {entity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
