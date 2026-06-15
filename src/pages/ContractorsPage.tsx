import { useState, useEffect } from "react";
import { GripVertical, AlertTriangle, ChevronDown, Search, Settings, ChevronsUpDown, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { fmt } from "../lib/docUtils";
import { MONTH_ORDER } from "../constants";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTRACTOR_STATUSES = ["Не создан", "Запрошен", "Получен", "Подписан ОРИГ", "Подписан ЭДО"] as const;

const CONTRACTOR_STATUS_COLORS: Record<ContractorDocStatus, string> = {
  "Не создан":     "#9CA3AF",
  "Запрошен":      "#0EA5E9",
  "Получен":       "#EAB308",
  "Подписан ОРИГ": "#10B981",
  "Подписан ЭДО":  "#10B981",
};

const CONTRACTOR_STATUS_BG: Record<ContractorDocStatus, string> = {
  "Не создан":     "bg-gray-100 text-gray-700",
  "Запрошен":      "bg-sky-50 text-sky-700",
  "Получен":       "bg-amber-50 text-amber-700",
  "Подписан ОРИГ": "bg-emerald-50 text-emerald-700",
  "Подписан ЭДО":  "bg-emerald-50 text-emerald-700",
};

const CLIENT_COL = "32px minmax(160px,16%) minmax(90px,8%) minmax(88px,7%) minmax(110px,10%) minmax(110px,10%) minmax(120px,11%) minmax(120px,11%) minmax(130px,12%) minmax(120px,10%)";
const INTERNAL_COL = "32px minmax(160px,16%) minmax(90px,8%) minmax(88px,7%) minmax(110px,10%) minmax(120px,11%) minmax(120px,11%) minmax(130px,12%) minmax(120px,10%)";
const DOC_COL = "40px minmax(140px,14%) minmax(170px,16%) minmax(100px,10%) minmax(110px,10%) minmax(130px,12%) minmax(110px,11%) minmax(110px,11%) minmax(180px,13%)";

const MONTH_ORDER_MAP = Object.fromEntries(MONTH_ORDER.map((m, i) => [m, i]));

// ─── Component ────────────────────────────────────────────────────────────────

interface ContractorsPageProps {
  subPage: "client" | "internal";
  onNavigate?: (page: string) => void;
}

export function ContractorsPage({ subPage, onNavigate }: ContractorsPageProps) {
  const [contractors, setContractors] = useState<ContractorProject[]>(
    () => subPage === "client" ? CLIENT_CONTRACTORS : INTERNAL_CONTRACTORS
  );

  useEffect(() => {
    setContractors(subPage === "client" ? CLIENT_CONTRACTORS : INTERNAL_CONTRACTORS);
  }, [subPage]);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Always-visible filters
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [contractorFilter, setContractorFilter] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Optional filter values
  const [directionFilter, setDirectionFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [monthFilter, setMonthFilter] = useState("");
  const [docManagerFilter, setDocManagerFilter] = useState("");

  // Which optional filters are shown
  const [visibleFilters, setVisibleFilters] = useState({ direction: false, year: true, month: false, docManager: false });

  // Month sort: null → asc → desc → null
  const [monthSort, setMonthSort] = useState<null | "asc" | "desc">(null);

  const toggleFilter = (key: keyof typeof visibleFilters) => {
    const wasOn = visibleFilters[key];
    setVisibleFilters(prev => ({ ...prev, [key]: !prev[key] }));
    if (wasOn) {
      if (key === "direction") setDirectionFilter("");
      if (key === "year") setYearFilter("");
      if (key === "month") setMonthFilter("");
      if (key === "docManager") setDocManagerFilter("");
    }
  };

  // Derived option lists
  const clientOptions = Array.from(new Set(contractors.map(p => p.client).filter(Boolean))) as string[];
  const contractorOptions = Array.from(new Set(contractors.map(p => p.contractor)));
  const responsibleOptions = Array.from(new Set(contractors.map(p => p.responsible.name)));
  const directionOptions = Array.from(new Set(contractors.map(p => p.direction)));
  const docManagerOptions = Array.from(new Set(contractors.map(p => p.doManager.name)));
  const yearOptions = Array.from(new Set(contractors.map(p => String(p.year)))).sort((a, b) => Number(b) - Number(a));
  const monthOptions = Array.from(new Set(contractors.map(p => p.month)))
    .sort((a, b) => (MONTH_ORDER_MAP[a] ?? 99) - (MONTH_ORDER_MAP[b] ?? 99));

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

  const colTemplate = subPage === "client" ? CLIENT_COL : INTERNAL_COL;

  const filteredData = contractors.filter(p => {
    if (subPage === "client" && clientFilter && p.client !== clientFilter) return false;
    if (contractorFilter && p.contractor !== contractorFilter) return false;
    if (responsibleFilter && p.responsible.name !== responsibleFilter) return false;
    if (statusFilter && !p.documents.some(d => d.status === statusFilter)) return false;
    if (visibleFilters.year && yearFilter && String(p.year) !== yearFilter) return false;
    if (visibleFilters.direction && directionFilter && p.direction !== directionFilter) return false;
    if (visibleFilters.month && monthFilter && p.month !== monthFilter) return false;
    if (visibleFilters.docManager && docManagerFilter && p.doManager.name !== docManagerFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.contractor.toLowerCase().includes(q) && !p.projectCode.toLowerCase().includes(q)) return false;
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

  return (
    <div>
      <div className="flex items-center gap-4 px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Подрядчики</h1>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 gap-0.5">
          <button
            onClick={() => onNavigate?.("contractors-client")}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              subPage === "client" ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Клиентские
          </button>
          <button
            onClick={() => onNavigate?.("contractors-internal")}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              subPage === "internal" ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Внутренние
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-8 pb-3">
        <div className="flex items-center gap-2 flex-wrap">

          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск..."
              className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-52"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {subPage === "client" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", clientFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {clientFilter || "Клиент"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setClientFilter("")}>Все клиенты</DropdownMenuItem>
                {clientOptions.map(c => <DropdownMenuItem key={c} onClick={() => setClientFilter(c)}>{c}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", contractorFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {contractorFilter || "Подрядчик"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setContractorFilter("")}>Все подрядчики</DropdownMenuItem>
              {contractorOptions.map(c => <DropdownMenuItem key={c} onClick={() => setContractorFilter(c)}>{c}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", responsibleFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
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
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", statusFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {statusFilter || "Статус"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("")}>Все статусы</DropdownMenuItem>
              {CONTRACTOR_STATUSES.map(s => (
                <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: CONTRACTOR_STATUS_COLORS[s] }} />
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {visibleFilters.direction && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", directionFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {directionFilter || "Направление"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDirectionFilter("")}>Все направления</DropdownMenuItem>
                {directionOptions.map(d => <DropdownMenuItem key={d} onClick={() => setDirectionFilter(d)}>{d}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleFilters.year && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", yearFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {yearFilter || "Год"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setYearFilter("")}>Все годы</DropdownMenuItem>
                {yearOptions.map(y => <DropdownMenuItem key={y} onClick={() => setYearFilter(y)}>{y}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleFilters.month && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", monthFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {monthFilter || "Месяц"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setMonthFilter("")}>Все месяцы</DropdownMenuItem>
                {monthOptions.map(m => <DropdownMenuItem key={m} onClick={() => setMonthFilter(m)}>{m}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleFilters.docManager && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", docManagerFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {docManagerFilter || "Менеджер ДО"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
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
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 flex-shrink-0">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-gray-400">Настройка фильтров</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["direction", "year", "month", "docManager"] as Array<keyof typeof visibleFilters>).map((key) => {
                const labels: Record<keyof typeof visibleFilters, string> = {
                  direction: "Направление", year: "Год", month: "Месяц", docManager: "Менеджер ДО",
                };
                return (
                  <DropdownMenuCheckboxItem key={key} checked={visibleFilters[key]} onCheckedChange={() => toggleFilter(key)}>
                    {labels[key]}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      <div className="pb-16">
        {/* Sticky column headers */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="px-8 py-2" style={{ display: "grid", gridTemplateColumns: colTemplate, alignItems: "center" }}>
            <div className="w-4" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Подрядчик</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ID проекта</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={() => setMonthSort(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null)}
            >
              Месяц
              {monthSort === "asc" && <ArrowUp className="w-3.5 h-3.5" />}
              {monthSort === "desc" && <ArrowDown className="w-3.5 h-3.5" />}
            </button>
            {subPage === "client" && <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Клиент</span>}
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Направление</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ответственный</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Менеджер ДО</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Прогресс</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Сумма</span>
          </div>
        </div>

        <div className="px-8 pt-2">
          {sortedData.map((project) => {
            const isExpanded = expanded.has(project.id);
            const pct = project.progress.total > 0 ? (project.progress.done / project.progress.total) * 100 : 0;

            return (
              <div key={project.id} className="mb-1">
                <div
                  className="px-4 py-3 bg-gray-50/80 rounded-lg cursor-pointer hover:bg-gray-100/70 transition-colors group"
                  style={{ display: "grid", gridTemplateColumns: colTemplate, alignItems: "center" }}
                  onClick={() => toggleExpand(project.id)}
                >
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform flex-shrink-0", !isExpanded && "-rotate-90")} />
                  <span className="font-semibold text-sm text-gray-900 truncate">{project.contractor}</span>
                  <span className="text-sm text-gray-700 font-medium">{project.projectCode}</span>
                  <span className="text-sm text-gray-500">{project.month}</span>
                  {subPage === "client" && <span className="text-sm text-gray-500">{project.client}</span>}
                  <span className="text-sm text-gray-500">{project.direction}</span>
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
                        <span className="px-3 py-2 font-medium">Документ №</span>
                        <span className="px-3 py-2 font-medium">Оплата план</span>
                        <span className="px-3 py-2 font-medium">Оплата факт</span>
                        <span className="px-3 py-2 font-medium">Смета</span>
                        <span className="px-3 py-2 font-medium">Комментарий</span>
                      </div>
                    </div>

                    <div className="space-y-1 mt-2">
                      {project.documents.map((doc) => (
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
                              {doc.comment || <span className="text-gray-300 italic">Добавить...</span>}
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
          })}
        </div>
      </div>
    </div>
  );
}

export default ContractorsPage;

// ─── Mock data ────────────────────────────────────────────────────────────────

export const CLIENT_CONTRACTORS: ContractorProject[] = [
  {
    id: 1,
    contractor: "ИП Смирнов А.В.",
    projectCode: "YAN-1",
    month: "Март",
    year: 2026,
    client: "Яндекс",
    direction: "Медиа",
    responsible: { initials: "КВ", name: "Кирилл В.", color: "bg-slate-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    progress: { done: 2, total: 5 },
    sum: 1850000,
    isOverdue: true,
    documents: [
      { id: 1, type: "Договор ГПХ", status: "Подписан ОРИГ", sum: 1850000, docNumber: "ГПХ-44", datePlan: "01.03.2026", dateFact: "28.02.2026", hasFile: true, comment: "" },
      { id: 2, type: "Акт ГПХ", status: "Получен", sum: 1850000, docNumber: "АГ-44", datePlan: "01.03.2026", dateFact: null, hasFile: false, comment: "", isOverdue: true, overdueDays: 103 },
      { id: 3, type: "Счёт", status: "Запрошен", sum: 1850000, docNumber: null, datePlan: "15.03.2026", dateFact: null, hasFile: false, comment: "" },
      { id: 4, type: "УПД", status: "Не создан", sum: null, docNumber: null, datePlan: "31.03.2026", dateFact: null, hasFile: false, comment: "" },
      { id: 5, type: "Акт", status: "Не создан", sum: null, docNumber: null, datePlan: "05.04.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
  {
    id: 2,
    contractor: "ООО Медиасервис",
    projectCode: "SBR-1",
    month: "Январь",
    year: 2026,
    client: "Сбер",
    direction: "ТВ",
    responsible: { initials: "АС", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" },
    progress: { done: 4, total: 4 },
    sum: 8400000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ", sum: 8400000, docNumber: "Д-118", datePlan: "15.01.2026", dateFact: "12.01.2026", hasFile: true, comment: "" },
      { id: 2, type: "Счёт", status: "Подписан ЭДО", sum: 8400000, docNumber: "С-554", datePlan: "20.01.2026", dateFact: "18.01.2026", hasFile: false, comment: "" },
      { id: 3, type: "Акт", status: "Подписан ОРИГ", sum: 8400000, docNumber: "А-89", datePlan: "31.01.2026", dateFact: "29.01.2026", hasFile: false, comment: "ТВ-размещение февраль" },
      { id: 4, type: "УПД", status: "Подписан ЭДО", sum: 8400000, docNumber: "У-34", datePlan: "05.02.2026", dateFact: "03.02.2026", hasFile: false, comment: "" },
    ],
  },
  {
    id: 3,
    contractor: "ИП Горелова Т.С.",
    projectCode: "AVI-2",
    month: "Март",
    year: 2026,
    client: "Авито",
    direction: "Инфлюенс",
    responsible: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    progress: { done: 1, total: 4 },
    sum: 980000,
    isOverdue: true,
    documents: [
      { id: 1, type: "Договор ГПХ", status: "Подписан ОРИГ", sum: 980000, docNumber: "ГПХ-51", datePlan: "10.03.2026", dateFact: "08.03.2026", hasFile: true, comment: "" },
      { id: 2, type: "Акт ГПХ", status: "Запрошен", sum: 980000, docNumber: null, datePlan: "01.04.2026", dateFact: null, hasFile: false, comment: "Жду от блогера", isOverdue: true, overdueDays: 72 },
      { id: 3, type: "Чек", status: "Не создан", sum: null, docNumber: null, datePlan: "15.04.2026", dateFact: null, hasFile: false, comment: "" },
      { id: 4, type: "Счёт", status: "Не создан", sum: null, docNumber: null, datePlan: "20.04.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
  {
    id: 4,
    contractor: "ООО Контент Лаб",
    projectCode: "HOZ-3",
    month: "Февраль",
    year: 2026,
    client: "—",
    direction: "Контент",
    responsible: { initials: "АС", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" },
    progress: { done: 3, total: 5 },
    sum: 2200000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ", sum: 2200000, docNumber: "Д-77", datePlan: "01.02.2026", dateFact: "29.01.2026", hasFile: true, comment: "" },
      { id: 2, type: "Приложение", status: "Подписан ОРИГ", sum: 2200000, docNumber: "П-12", datePlan: "05.02.2026", dateFact: "03.02.2026", hasFile: false, comment: "" },
      { id: 3, type: "Счёт", status: "Подписан ЭДО", sum: 2200000, docNumber: "С-203", datePlan: "10.02.2026", dateFact: "08.02.2026", hasFile: false, comment: "" },
      { id: 4, type: "Акт", status: "Получен", sum: 2200000, docNumber: "А-44", datePlan: "28.02.2026", dateFact: null, hasFile: false, comment: "На проверке у бухгалтера" },
      { id: 5, type: "УПД", status: "Не создан", sum: null, docNumber: null, datePlan: "05.03.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
  {
    id: 5,
    contractor: "ИП Рябов Д.О.",
    projectCode: "YAN-3",
    month: "Февраль",
    year: 2026,
    client: "Яндекс",
    direction: "Контекст",
    responsible: { initials: "АС", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    progress: { done: 0, total: 3 },
    sum: 550000,
    isOverdue: true,
    documents: [
      { id: 1, type: "Договор ГПХ", status: "Запрошен", sum: 550000, docNumber: null, datePlan: "15.02.2026", dateFact: null, hasFile: true, comment: "Напомнить подрядчику", isOverdue: true, overdueDays: 117 },
      { id: 2, type: "Акт ГПХ", status: "Не создан", sum: null, docNumber: null, datePlan: "01.03.2026", dateFact: null, hasFile: false, comment: "" },
      { id: 3, type: "Чек", status: "Не создан", sum: null, docNumber: null, datePlan: "05.03.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
  {
    id: 6,
    contractor: "ООО Диджитал Про",
    projectCode: "HOZ-1",
    month: "Апрель",
    year: 2026,
    client: "—",
    direction: "Медиа",
    responsible: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" },
    progress: { done: 2, total: 4 },
    sum: 3700000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ", sum: 3700000, docNumber: "Д-99", datePlan: "05.04.2026", dateFact: "03.04.2026", hasFile: true, comment: "" },
      { id: 2, type: "ДС", status: "Подписан ОРИГ", sum: 3700000, docNumber: "ДС-14", datePlan: "10.04.2026", dateFact: "09.04.2026", hasFile: false, comment: "" },
      { id: 3, type: "Счёт", status: "Получен", sum: 3700000, docNumber: "С-612", datePlan: "20.04.2026", dateFact: null, hasFile: false, comment: "Ждём подтверждения" },
      { id: 4, type: "Акт", status: "Не создан", sum: null, docNumber: null, datePlan: "30.04.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
];

export const INTERNAL_CONTRACTORS: ContractorProject[] = [
  {
    id: 101,
    contractor: "ИП Петров С.И.",
    projectCode: "HOZ-1",
    month: "Январь",
    year: 2026,
    direction: "IT",
    responsible: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    doManager: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    progress: { done: 2, total: 3 },
    sum: 180000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ", sum: 180000, docNumber: "Д-201", datePlan: "10.01.2026", dateFact: "09.01.2026", hasFile: true, comment: "" },
      { id: 2, type: "Акт", status: "Подписан ОРИГ", sum: 180000, docNumber: "А-101", datePlan: "31.01.2026", dateFact: "30.01.2026", hasFile: false, comment: "" },
      { id: 3, type: "Счёт", status: "Не создан", sum: null, docNumber: null, datePlan: "05.02.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
  {
    id: 102,
    contractor: "ООО Клинсервис",
    projectCode: "HOZ-2",
    month: "Февраль",
    year: 2026,
    direction: "АХО",
    responsible: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    doManager: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    progress: { done: 3, total: 3 },
    sum: 95000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ", sum: 95000, docNumber: "Д-202", datePlan: "01.02.2026", dateFact: "30.01.2026", hasFile: true, comment: "" },
      { id: 2, type: "Счёт", status: "Подписан ЭДО", sum: 95000, docNumber: "С-301", datePlan: "15.02.2026", dateFact: "14.02.2026", hasFile: false, comment: "" },
      { id: 3, type: "Акт", status: "Подписан ОРИГ", sum: 95000, docNumber: "А-102", datePlan: "28.02.2026", dateFact: "27.02.2026", hasFile: false, comment: "" },
    ],
  },
  {
    id: 103,
    contractor: "ИП Захарова Л.Д.",
    projectCode: "HOZ-3",
    month: "Март",
    year: 2026,
    direction: "HR",
    responsible: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    doManager: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    progress: { done: 0, total: 2 },
    sum: 240000,
    isOverdue: true,
    documents: [
      { id: 1, type: "Договор ГПХ", status: "Запрошен", sum: 240000, docNumber: null, datePlan: "01.03.2026", dateFact: null, hasFile: false, comment: "", isOverdue: true, overdueDays: 103 },
      { id: 2, type: "Акт ГПХ", status: "Не создан", sum: null, docNumber: null, datePlan: "31.03.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
  {
    id: 104,
    contractor: "ООО Техноаренда",
    projectCode: "HOZ-4",
    month: "Март",
    year: 2026,
    direction: "IT",
    responsible: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    doManager: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    progress: { done: 1, total: 4 },
    sum: 320000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ", sum: 320000, docNumber: "Д-205", datePlan: "05.03.2026", dateFact: "04.03.2026", hasFile: true, comment: "" },
      { id: 2, type: "Счёт", status: "Получен", sum: 320000, docNumber: "С-412", datePlan: "20.03.2026", dateFact: null, hasFile: false, comment: "Ждём оригинал" },
      { id: 3, type: "Акт", status: "Не создан", sum: null, docNumber: null, datePlan: "31.03.2026", dateFact: null, hasFile: false, comment: "" },
      { id: 4, type: "УПД", status: "Не создан", sum: null, docNumber: null, datePlan: "05.04.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
];
