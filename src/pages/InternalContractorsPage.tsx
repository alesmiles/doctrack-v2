import { useState } from "react";
import { GripVertical, AlertTriangle, ChevronDown, Search, Settings, ChevronsUpDown, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { fmt } from "../lib/docUtils";
import { MONTH_ORDER, DOC_TYPE_ORDER } from "../constants";
import { ContractorProject, ContractorDocStatus } from "../types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuCheckboxItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { InternalContractorKanbanBoard } from "@/components/InternalContractorKanbanBoard";
import { INTERNAL_CONTRACTORS, internalContractorKanbanDocuments } from "@/mocks/internalContractorsMockData";

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTRACTOR_STATUSES = ["Not Created", "Requested", "Received", "Signed ORIG", "Signed EDO"] as const;

const CONTRACTOR_STATUS_COLORS: Record<ContractorDocStatus, string> = {
  "Not Created":  "#9CA3AF",
  "Requested":    "#0EA5E9",
  "Received":     "#EAB308",
  "Signed ORIG":  "#10B981",
  "Signed EDO":   "#10B981",
};

const CONTRACTOR_STATUS_BG: Record<ContractorDocStatus, string> = {
  "Not Created":  "bg-gray-100 text-gray-700",
  "Requested":    "bg-sky-50 text-sky-700",
  "Received":     "bg-amber-50 text-amber-700",
  "Signed ORIG":  "bg-emerald-50 text-emerald-700",
  "Signed EDO":   "bg-emerald-50 text-emerald-700",
};

const INTERNAL_COL = "32px minmax(160px,16%) minmax(90px,8%) minmax(88px,7%) minmax(110px,10%) minmax(120px,11%) minmax(120px,11%) minmax(130px,12%) minmax(120px,10%)";
const DOC_COL = "40px minmax(140px,14%) minmax(170px,16%) minmax(100px,10%) minmax(110px,10%) minmax(130px,12%) minmax(110px,11%) minmax(110px,11%) minmax(180px,13%)";

const MONTH_ORDER_MAP = Object.fromEntries(MONTH_ORDER.map((m, i) => [m, i]));

// ─── Component ────────────────────────────────────────────────────────────────

export function InternalContractorsPage() {
  const [contractors, setContractors] = useState<ContractorProject[]>(() => INTERNAL_CONTRACTORS.slice());

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [groupByDirection, setGroupByDirection] = useState(false);

  const [search, setSearch] = useState("");
  const [contractorFilter, setContractorFilter] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");

  const [docManagerFilter, setDocManagerFilter] = useState("");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  const [contractorQuery, setContractorQuery] = useState("");

  const [visibleFilters, setVisibleFilters] = useState({ docManager: false });

  const [monthSort, setMonthSort] = useState<null | "asc" | "desc">(null);

  const toggleFilter = (key: keyof typeof visibleFilters) => {
    const wasOn = visibleFilters[key];
    setVisibleFilters(prev => ({ ...prev, [key]: !prev[key] }));
    if (wasOn) {
      if (key === "docManager") setDocManagerFilter("");
    }
  };

  const contractorOptions = Array.from(new Set([
    ...contractors.map(p => p.contractor),
    ...internalContractorKanbanDocuments.map(d => d.contractorName),
  ]));
  const visibleContractorOptions = contractorOptions.filter(c => c.toLowerCase().includes(contractorQuery.toLowerCase()));
  const responsibleOptions = Array.from(new Set([
    ...contractors.map(p => p.responsible.name),
    ...internalContractorKanbanDocuments.map(d => d.responsibleName).filter(Boolean) as string[],
  ]));
  const directionOptions = Array.from(new Set([
    ...contractors.map(p => p.direction).filter(Boolean) as string[],
    ...internalContractorKanbanDocuments.map(d => d.direction).filter(Boolean) as string[],
  ]));
  const docManagerOptions = Array.from(new Set([
    ...contractors.map(p => p.doManager.name),
    ...internalContractorKanbanDocuments.map(d => d.doManagerName).filter(Boolean) as string[],
  ]));
  const docTypeOptions = Array.from(new Set([
    ...DOC_TYPE_ORDER,
    ...contractors.flatMap(p => p.documents.map(d => d.type)),
  ]));

  const handleStatusChange = (projectId: number, docId: number, status: ContractorDocStatus) => {
    setContractors(prev => prev.map(p => p.id !== projectId ? p : {
      ...p,
      documents: p.documents.map(d => d.id !== docId ? d : { ...d, status }),
    }));
  };

  const toggleExpand = (id: number) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const filteredData = contractors.filter(p => {
    if (contractorFilter && p.contractor !== contractorFilter) return false;
    if (responsibleFilter && p.responsible.name !== responsibleFilter) return false;
    if (directionFilter && p.direction !== directionFilter) return false;
    if (visibleFilters.docManager && docManagerFilter && p.doManager.name !== docManagerFilter) return false;
    if (showOverdueOnly && !p.isOverdue) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.contractor.toLowerCase().includes(q) && !p.projectCode.toLowerCase().includes(q) && !p.documents.some(d => d.type.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const sortedData = monthSort === null
    ? filteredData
    : [...filteredData].sort((a, b) => {
      const idxA = MONTH_ORDER_MAP[a.month] ?? 99;
      const idxB = MONTH_ORDER_MAP[b.month] ?? 99;
      return monthSort === "asc" ? idxA - idxB : idxB - idxA;
    });

  const getFilteredDocs = (p: ContractorProject) => {
    let docs = p.documents;
    if (docTypeFilter) docs = docs.filter(d => d.type === docTypeFilter);
    return docs;
  };

  const hasAnyFilter = !!(search || contractorFilter || responsibleFilter || docTypeFilter
    || directionFilter || docManagerFilter || showOverdueOnly || groupByDirection);

  const resetFilters = () => {
    setSearch(""); setContractorFilter(""); setResponsibleFilter(""); setDocTypeFilter("");
    setDirectionFilter(""); setDocManagerFilter(""); setShowOverdueOnly(false);
    setGroupByDirection(false);
    setVisibleFilters({ docManager: false });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Подрядчики</h1>
          <p className="text-sm text-gray-500">внутренние</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      <div className="px-8 pb-3">
        <div className="flex items-center gap-2 flex-wrap">

          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск…"
              className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-52"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DropdownMenu onOpenChange={(open) => { if (!open) setContractorQuery(""); }}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                {contractorFilter || "Подрядчик"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="px-2 py-1.5" onKeyDown={(e) => e.stopPropagation()}>
                <Input
                  autoFocus
                  placeholder="Поиск…"
                  className="h-8 text-sm"
                  value={contractorQuery}
                  onChange={(e) => setContractorQuery(e.target.value)}
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setContractorFilter("")}>Все подрядчики</DropdownMenuItem>
              {visibleContractorOptions.map(c => <DropdownMenuItem key={c} onClick={() => setContractorFilter(c)}>{c}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                {responsibleFilter || "Ответственный"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setResponsibleFilter("")}>Все</DropdownMenuItem>
              {responsibleOptions.map(r => <DropdownMenuItem key={r} onClick={() => setResponsibleFilter(r)}>{r}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                {docTypeFilter || "Тип"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setDocTypeFilter("")}>Все типы</DropdownMenuItem>
              {docTypeOptions.map(t => <DropdownMenuItem key={t} onClick={() => setDocTypeFilter(t)}>{t}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                {directionFilter || "Направление"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDirectionFilter("")}>Все направления</DropdownMenuItem>
              {directionOptions.map(d => <DropdownMenuItem key={d} onClick={() => setDirectionFilter(d)}>{d}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-sm bg-gray-50 border-gray-200"
            onClick={() => setGroupByDirection((v) => !v)}
          >
            Группировка
          </Button>

          {visibleFilters.docManager && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                  {docManagerFilter || "МенДО"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDocManagerFilter("")}>Все</DropdownMenuItem>
                {docManagerOptions.map(d => <DropdownMenuItem key={d} onClick={() => setDocManagerFilter(d)}>{d}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-400 flex-shrink-0 hover:bg-gray-100 hover:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-600"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-gray-400">Настройки фильтров</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem checked={showOverdueOnly} onCheckedChange={() => setShowOverdueOnly((v) => !v)}>
                Просрочено
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem checked={visibleFilters.docManager} onCheckedChange={() => toggleFilter("docManager")}>
                МенДО
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasAnyFilter && (
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={resetFilters}>
              <span className="mr-1">×</span> Сбросить
            </Button>
          )}

        </div>
      </div>

      {viewMode === "kanban" ? (
        <InternalContractorKanbanBoard
          search={search}
          contractorFilter={contractorFilter}
          responsibleFilter={responsibleFilter}
          typeFilter={docTypeFilter}
          directionFilter={directionFilter}
          doManagerFilter={docManagerFilter}
          showOverdueOnly={showOverdueOnly}
          groupByDirection={groupByDirection}
        />
      ) : (
      <div className="pb-16">
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="px-8 py-2" style={{ display: "grid", gridTemplateColumns: INTERNAL_COL, alignItems: "center" }}>
            <div className="w-4" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Подрядчик</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Код проекта</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={() => setMonthSort(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null)}
            >
              Месяц
              {monthSort === "asc" && <ArrowUp className="w-3.5 h-3.5" />}
              {monthSort === "desc" && <ArrowDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Направление</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ответственный</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">МенДО</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Прогресс</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Сумма</span>
          </div>
        </div>

        <div className="px-8 pt-2">
          {sortedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <Search className="h-10 w-10 text-gray-300" />
              <div>
                <p className="text-base font-medium text-gray-700">Ничего не найдено</p>
                <p className="mt-1 text-sm text-gray-400">Попробуйте изменить фильтры</p>
              </div>
            </div>
          ) : (
          sortedData.map((project) => {
            const isExpanded = expanded.has(project.id);
            const pct = project.progress.total > 0 ? (project.progress.done / project.progress.total) * 100 : 0;
            const docs = getFilteredDocs(project);

            return (
              <div key={project.id} className="mb-1">
                <div
                  className="px-4 py-3 bg-gray-50/80 rounded-lg cursor-pointer hover:bg-gray-100/70 transition-colors group"
                  style={{ display: "grid", gridTemplateColumns: INTERNAL_COL, alignItems: "center" }}
                  onClick={() => toggleExpand(project.id)}
                >
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform flex-shrink-0", !isExpanded && "-rotate-90")} />
                  <span className="font-semibold text-sm text-gray-900 truncate">{project.contractor}</span>
                  <span className="text-sm text-gray-700 font-medium">{project.projectCode}</span>
                  <span className="text-sm text-gray-500">{project.month}</span>
                  <span className="text-sm text-gray-500 truncate">{project.direction || "—"}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0", project.responsible.color)}>{project.responsible.initials}</div>
                    <span className="text-sm text-gray-600 truncate">{project.responsible.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0", project.doManager.color)}>{project.doManager.initials}</div>
                    <span className="text-sm text-gray-600 truncate">{project.doManager.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums">{project.progress.done}/{project.progress.total}</span>
                  </div>
                  {project.isOverdue ? (
                    <div className="flex items-center gap-1 text-red-500 whitespace-nowrap">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span className="font-semibold tabular-nums">{fmt(project.sum)}</span>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-900 tabular-nums whitespace-nowrap">{fmt(project.sum)}</span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-1 pl-8">
                    <div className="sticky top-0 z-20 bg-white">
                      <div className="grid text-[10px] uppercase text-gray-400 tracking-wider" style={{ gridTemplateColumns: DOC_COL, alignItems: "center" }}>
                        <span />
                        <span className="px-3 py-2 font-medium">Тип</span>
                        <span className="px-3 py-2 font-medium">Статус</span>
                        <span className="px-3 py-2 text-right font-medium">Сумма</span>
                        <span className="px-3 py-2 font-medium">№ документа</span>
                        <span className="px-3 py-2 font-medium">План оплаты</span>
                        <span className="px-3 py-2 font-medium">Факт оплаты</span>
                        <span className="px-3 py-2 font-medium">Смета</span>
                        <span className="px-3 py-2 font-medium">Комментарий</span>
                      </div>
                    </div>

                    <div className="space-y-1 mt-2">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="group rounded-lg border border-transparent bg-white hover:border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{ display: "grid", gridTemplateColumns: DOC_COL, alignItems: "center" }}
                        >
                          <div className="pl-3 pr-1 py-2.5 w-10">
                            <GripVertical className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
                          </div>

                          <div className="px-3 py-2.5">
                            <Badge variant="secondary" className="font-normal text-xs bg-gray-100 text-gray-700 whitespace-nowrap">
                              {doc.type}
                            </Badge>
                          </div>

                          <div className="px-3 py-2.5">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={cn(
                                  "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer whitespace-nowrap",
                                  CONTRACTOR_STATUS_BG[doc.status]
                                )}>
                                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: CONTRACTOR_STATUS_COLORS[doc.status] }} />
                                  {doc.status}
                                  <ChevronsUpDown className="w-3 h-3 opacity-50" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                {CONTRACTOR_STATUSES.map(s => (
                                  <DropdownMenuItem key={s} onClick={() => handleStatusChange(project.id, doc.id, s)}>
                                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: CONTRACTOR_STATUS_COLORS[s] }} />
                                    {s}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="px-3 py-2.5 text-right text-sm tabular-nums whitespace-nowrap">
                            {doc.sum != null
                              ? <span className="font-medium">{fmt(doc.sum)}</span>
                              : <span className="text-gray-400">—</span>
                            }
                          </div>

                          <div className="px-3 py-2.5">
                            {doc.docNumber ? (
                              <button className="text-blue-600 hover:text-blue-800 text-sm hover:underline underline-offset-2 transition-colors">
                                {doc.docNumber}
                              </button>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>

                          <div className="px-3 py-2.5 text-sm text-gray-600 whitespace-nowrap overflow-hidden">
                            <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                              {doc.isOverdue ? (
                                <>
                                  <span className="text-red-500">{doc.datePlan}</span>
                                  <span className="text-[11px] text-red-500">+{doc.overdueDays} дн.</span>
                                </>
                              ) : (
                                <span>{doc.datePlan ?? "—"}</span>
                              )}
                            </div>
                          </div>

                          <div className="px-3 py-2.5 text-sm text-gray-600">{doc.dateFact ?? "—"}</div>

                          <div className="px-3 py-2.5">
                            {doc.hasFile ? (
                              <button
                                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
                                onClick={() => console.log("open file", doc.id)}
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>

                          <div className="px-3 py-2.5 text-sm text-gray-600 max-w-[180px]">
                            <span
                              className="cursor-pointer hover:bg-gray-100 rounded px-1.5 py-0.5 -mx-1.5 inline-block min-h-[24px] min-w-[40px] transition-colors"
                              onClick={() => console.log("edit comment", doc.id)}
                            >
                              {doc.comment || <span className="text-gray-300 italic">Добавить…</span>}
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className="pl-8 pt-1 pb-2">
                        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors py-1" onClick={(e) => { e.stopPropagation(); console.log("add doc", project.id); }}>
                          + Добавить документ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default InternalContractorsPage;
