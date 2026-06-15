import React from "react";
import { Search, ChevronDown, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import SortableFilterItem from "./SortableFilterItem";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  filterOrder: string[];
  filterSensors: any;
  onFilterDragEnd: (e: any) => void;
  renderFilter: (id: string) => React.ReactNode;
  optEnabled: Record<string, boolean>;
  setOptEnabled: (v: Record<string, boolean>) => void;
  directionOptions: string[];
  monthOptions: string[];
  yearOptions: string[];
  doManagerOptions: string[];
  directionFilter: string;
  setDirectionFilter: (v: string) => void;
  yearFilter: string;
  setYearFilter: (v: string) => void;
  monthFilter: string;
  setMonthFilter: (v: string) => void;
  doManagerFilter: string;
  setDoManagerFilter: (v: string) => void;
  showOverdueOnly: boolean;
  setShowOverdueOnly: (v: boolean) => void;
  hasAnyFilter?: boolean;
  resetFilters?: () => void;
}

export function FilterBar(props: FilterBarProps) {
  const {
    search, setSearch, filterOrder, filterSensors, onFilterDragEnd, renderFilter,
    optEnabled, setOptEnabled, directionOptions, monthOptions, yearOptions, doManagerOptions,
    directionFilter, setDirectionFilter, yearFilter, setYearFilter, monthFilter, setMonthFilter,
    doManagerFilter, setDoManagerFilter, showOverdueOnly, setShowOverdueOnly, hasAnyFilter, resetFilters,
  } = props;

  return (
    <div className="px-8 pb-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Поиск..." className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-52" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <DndContext sensors={filterSensors} collisionDetection={closestCenter} onDragEnd={onFilterDragEnd}>
          <SortableContext items={filterOrder} strategy={horizontalListSortingStrategy}>
            {filterOrder.map((fid) => (
              <SortableFilterItem key={fid} id={fid}>
                {renderFilter(fid as any)}
              </SortableFilterItem>
            ))}
          </SortableContext>
        </DndContext>

        {optEnabled.direction && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", (optEnabled.direction && directionFilter) && "text-blue-700 border-blue-300 bg-blue-50")}>
                {directionFilter || "Направление"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDirectionFilter("")}>Все</DropdownMenuItem>
              {directionOptions.map((d) => <DropdownMenuItem key={d} onClick={() => setDirectionFilter(d)}>{d}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {optEnabled.year && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", (optEnabled.year && yearFilter) && "text-blue-700 border-blue-300 bg-blue-50")}>
                {yearFilter || "Год"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setYearFilter("")}>Все годы</DropdownMenuItem>
              {yearOptions.map((y) => <DropdownMenuItem key={y} onClick={() => setYearFilter(y)}>{y}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {optEnabled.month && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", (optEnabled.month && monthFilter) && "text-blue-700 border-blue-300 bg-blue-50")}>
                {monthFilter || "Месяц"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setMonthFilter("")}>Все месяцы</DropdownMenuItem>
              {monthOptions.map((m) => <DropdownMenuItem key={m} onClick={() => setMonthFilter(m)}>{m}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {optEnabled.doManager && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", (optEnabled.doManager && doManagerFilter) && "text-blue-700 border-blue-300 bg-blue-50")}>
                {doManagerFilter || "Менеджер ДО"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDoManagerFilter("")}>Все</DropdownMenuItem>
              {doManagerOptions.map((m) => <DropdownMenuItem key={m} onClick={() => setDoManagerFilter(m)}>{m}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {optEnabled.overdue && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm bg-gray-50 text-gray-700 border-gray-200"
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
          >
            Просроченные оплаты
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 flex-shrink-0">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-gray-400">Настройка фильтров</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(optEnabled) as string[]).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={optEnabled[key]}
                onCheckedChange={(v) => setOptEnabled({ ...optEnabled, [key]: !!v })}
              >
                {key}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasAnyFilter && resetFilters && (
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={resetFilters}>
            Сбросить всё
          </Button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
