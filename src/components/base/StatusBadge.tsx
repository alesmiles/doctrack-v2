import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { StatusOption } from "./types";

interface StatusBadgeProps {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
}

export function StatusBadge({ value, options, onChange }: StatusBadgeProps) {
  const current = options.find((o) => o.label === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap hover:bg-gray-200 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: current?.color ?? "#9CA3AF" }} />
          {value || "—"}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.label}
            onClick={(e) => {
              e.stopPropagation();
              onChange(option.label);
            }}
            className={cn(option.label === value && "font-semibold")}
          >
            <span className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: option.color }} />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
