import { LayoutGrid, Table } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewSwitcherProps {
  value: "kanban" | "table";
  onChange: (value: "kanban" | "table") => void;
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  const options = [
    { key: "kanban" as const, label: "Канбан", icon: LayoutGrid },
    { key: "table" as const, label: "Таблица", icon: Table },
  ];

  return (
    <div className="inline-flex items-center rounded-lg bg-gray-100 p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition",
              isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ViewSwitcher;
