import { useState, useCallback } from "react";
import { ArrowDown, ArrowUp, Search, ChevronDown, GripVertical, AlertTriangle, Settings } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableDocRow from "@/components/DocRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { computeProgress, fmt, getMonthOnly, isOverduePayment } from "../lib/docUtils";
import { RAW_PROJECTS } from "../mocks/projects";
import { PROJECT_COL_TEMPLATE, DOC_COL_TEMPLATE, MONTH_ORDER, MONTH_RU, STATUSES, CLIENT_DOC_TYPES, DOC_TYPE_ORDER, STATUS_COLORS } from "../constants";
import { Project } from "../types";
import { cn } from "@/lib/utils";
import AIPanel from "@/components/AIPanel";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CLIENT_NAMES } from "@/utils/clients";
import { ViewSwitcher } from "@/components/ViewSwitcher";

export function ClientsPage() {
  const [projects, setProjects] = useState<Project[]>(() => RAW_PROJECTS.slice());
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));
  const [aiOpen, setAiOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [groupByProject, setGroupByProject] = useState(false);

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [kamFilter, setKamFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [monthSortDir, setMonthSortDir] = useState<null | "asc" | "desc">(null);
  const [doManagerFilter, setDoManagerFilter] = useState("");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState({ direction: false, month: false, doManager: false });
  const [deletedDocTypes, setDeletedDocTypes] = useState<Record<string, Set<string>>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const clientOptions = CLIENT_NAMES;
  const kamOptions = Array.from(new Set(projects.map((p) => p.kam.name)));
  const doManagerOptions = Array.from(new Set(projects.map((p) => p.doManager.name)));
  const directionOptions = Array.from(new Set(projects.map((p) => p.direction)));

  const getActiveDocTypes = () => {
    const base = clientFilter && CLIENT_DOC_TYPES[clientFilter]
      ? [...CLIENT_DOC_TYPES[clientFilter]]
      : [...DOC_TYPE_ORDER];
    const deleted = deletedDocTypes[clientFilter] ?? new Set<string>();
    return base.filter((t) => !deleted.has(t)).sort((a, b) => DOC_TYPE_ORDER.indexOf(a) - DOC_TYPE_ORDER.indexOf(b));
  };

  const getAvailableToAdd = () => {
    const base = clientFilter && CLIENT_DOC_TYPES[clientFilter]
      ? [...CLIENT_DOC_TYPES[clientFilter]]
      : [...DOC_TYPE_ORDER];
    const active = new Set(getActiveDocTypes());
    return base.filter((t) => !active.has(t));
  };

  const activeDocTypes = getActiveDocTypes();

  const toggleFilterVisibility = (key: keyof typeof visibleFilters) => {
    const wasVisible = visibleFilters[key];
    setVisibleFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    if (wasVisible) {
      if (key === "direction") setDirectionFilter("");
      if (key === "month") setMonthFilter("");
      if (key === "doManager") setDoManagerFilter("");
    }
  };

  const hasAnyFilter = !!(search || clientFilter || kamFilter || docTypeFilter || statusFilter
    || directionFilter || monthFilter || doManagerFilter
    || showOverdueOnly || groupByProject);

  const resetFilters = () => {
    setSearch(""); setClientFilter(""); setKamFilter(""); setDocTypeFilter(""); setStatusFilter("");
    setDirectionFilter(""); setMonthFilter(""); setDoManagerFilter(""); setShowOverdueOnly(false);
    setGroupByProject(false);
    setVisibleFilters({ direction: false, month: false, doManager: false });
  };

  const filteredProjects = projects.filter((p) => {
    if (clientFilter && p.client !== clientFilter) return false;
    if (kamFilter && p.kam.name !== kamFilter) return false;
    if (doManagerFilter && p.doManager.name !== doManagerFilter) return false;
    if (directionFilter && p.direction !== directionFilter) return false;
    if (monthFilter && getMonthOnly(p.period) !== monthFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.client.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.documents.some((d) => d.type.toLowerCase().includes(q))) return false;
    }
    if (showOverdueOnly && !p.documents.some(isOverduePayment)) return false;
    return true;
  });

  const sortedProjects = monthSortDir === null
    ? filteredProjects
    : [...filteredProjects].sort((a, b) => {
      const idxA = MONTH_ORDER.indexOf(getMonthOnly(a.period));
      const idxB = MONTH_ORDER.indexOf(getMonthOnly(b.period));
      return monthSortDir === "asc" ? idxA - idxB : idxB - idxA;
    });

  const getFilteredDocs = (p: Project) => {
    let docs = p.documents;
    if (statusFilter) docs = docs.filter((d) => d.status === statusFilter);
    if (docTypeFilter) docs = docs.filter((d) => d.type === docTypeFilter);
    return docs;
  };

  const toggleExpand = (id: number) => setExpanded((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const handleStatusChange = (pid: number, did: number, status: any) =>
    setProjects((prev) => prev.map((p) => p.id !== pid ? p : ({ ...p, documents: p.documents.map((d) => d.id !== did ? d : { ...d, status }), progress: computeProgress(p.documents.map((d) => d.id !== did ? d : { ...d, status })) })));

  const handleCommentChange = (pid: number, did: number, comment: string) =>
    setProjects((prev) => prev.map((p) => p.id !== pid ? p : ({ ...p, documents: p.documents.map((d) => d.id !== did ? d : { ...d, comment }) })));

  const handleDocDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const [apStr, adStr] = (active.id as string).split("-");
    const [opStr, odStr] = (over.id as string).split("-");
    const apId = Number(apStr);
    if (apId !== Number(opStr)) return;
    setProjects((prev) => prev.map((p) => {
      if (p.id !== apId) return p;
      const docs = [...p.documents];
      const fi = docs.findIndex((d) => d.id === Number(adStr));
      const ti = docs.findIndex((d) => d.id === Number(odStr));
      if (fi === -1 || ti === -1) return p;
      const [m] = docs.splice(fi, 1);
      docs.splice(ti, 0, m);
      return { ...p, documents: docs };
    }));
  }, []);

  const restoreDocType = (type: string) => {
    setDeletedDocTypes((prev) => {
      const key = clientFilter || "__all__";
      const existing = prev[key] ?? new Set<string>();
      const next = new Set(existing);
      next.delete(type);
      return { ...prev, [key]: next };
    });
  };

  return (
    <div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-8 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                  {clientFilter || "Клиент"}
                  <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setClientFilter("")}>Все клиенты</DropdownMenuItem>
                {clientOptions.map(c => <DropdownMenuItem key={c} onClick={() => setClientFilter(c)}>{c}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                  {kamFilter || "КАМ"}
                  <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setKamFilter("")}>Все КАМ</DropdownMenuItem>
                {kamOptions.map(k => <DropdownMenuItem key={k} onClick={() => setKamFilter(k)}>{k}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                  {docTypeFilter || "Тип"}
                  <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setDocTypeFilter("")}>Все типы</DropdownMenuItem>
                    {activeDocTypes.map(t => (
                      <DropdownMenuItem key={t} onClick={() => setDocTypeFilter(t)}>{t}</DropdownMenuItem>
                    ))}
                {getAvailableToAdd().length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-gray-400">Добавить</DropdownMenuLabel>
                    {getAvailableToAdd().map(t => (
                      <DropdownMenuItem key={t} className="text-gray-400" onClick={() => restoreDocType(t)}>
                        <span className="mr-1">+</span> {t}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-sm bg-gray-50 border-gray-200"
              onClick={() => setGroupByProject((v) => !v)}
            >
              Группировка
            </Button>

            {visibleFilters.direction && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                    {directionFilter || "Направление"}
                    <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDirectionFilter("")}>Все направления</DropdownMenuItem>
                  {directionOptions.map(d => <DropdownMenuItem key={d} onClick={() => setDirectionFilter(d)}>{d}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {visibleFilters.month && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                    {monthFilter ? MONTH_RU[monthFilter] : "Месяц"}
                    <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setMonthFilter("")}>Все месяцы</DropdownMenuItem>
                  {MONTH_ORDER.map(m => <DropdownMenuItem key={m} onClick={() => setMonthFilter(m)}>{MONTH_RU[m]}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {visibleFilters.doManager && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                    {doManagerFilter || "МенДО"}
                    <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDoManagerFilter("")}>Все</DropdownMenuItem>
                  {doManagerOptions.map(d => <DropdownMenuItem key={d} onClick={() => setDoManagerFilter(d)}>{d}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {viewMode === "table" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", statusFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                    {statusFilter || "Статус"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("")}>Все статусы</DropdownMenuItem>
                  {STATUSES.map(s => (
                    <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                      <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: (STATUS_COLORS as any)?.[s] ?? "#999" }} />{s}
                    </DropdownMenuItem>
                  ))}
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

                <DropdownMenuCheckboxItem checked={visibleFilters.doManager} onCheckedChange={() => toggleFilterVisibility("doManager")}>
                  МенДО
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem checked={visibleFilters.direction} onCheckedChange={() => toggleFilterVisibility("direction")}>
                  Направление
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem checked={visibleFilters.month} onCheckedChange={() => toggleFilterVisibility("month")}>
                  Месяц
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
      </div>

      {viewMode === "kanban" ? (
        <KanbanBoard
          search={search}
          clientFilter={clientFilter}
          kamFilter={kamFilter}
          menDoFilter={doManagerFilter}
          typeFilter={docTypeFilter}
          directionFilter={directionFilter}
          monthFilter={monthFilter}
          showOverdueOnly={showOverdueOnly}
          groupByProject={groupByProject}
        />
      ) : (
        <div className="pb-16">
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
            <div className="px-8 py-2" style={{ display: "grid", gridTemplateColumns: PROJECT_COL_TEMPLATE, alignItems: "center" }}>
              <div className="w-4" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide" style={{padding: '8px 12px', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left'}}>КЛИЕНТ</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide" style={{padding: '8px 12px', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left'}}>ПРОЕКТ</span>
              <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wide transition-colors hover:text-gray-600" onClick={() => setMonthSortDir(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null)} style={{padding: '8px 12px', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left'}}>
                МЕСЯЦ
                {monthSortDir === "asc" && <ArrowUp className="w-3.5 h-3.5" />}
                {monthSortDir === "desc" && <ArrowDown className="w-3.5 h-3.5" />}
              </button>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide" style={{padding: '8px 12px', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left'}}>НАПРАВЛЕНИЕ</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide" style={{padding: '8px 12px', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left'}}>КАМ</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide" style={{padding: '8px 12px', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left'}}>МенДО</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide" style={{padding: '8px 12px', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left'}}>ПРОГРЕСС</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide" style={{padding: '8px 12px', fontSize: 11, letterSpacing: '0.04em', textAlign: 'right'}}>СУММА</span>
              <div className="w-6" />
            </div>
          </div>

          <div className="px-8 pt-2">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <Search className="h-10 w-10 text-gray-300" />
                <div>
                  <p className="text-base font-medium text-gray-700">No results found</p>
                  <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              sortedProjects.map((project) => {
                const docs = getFilteredDocs(project);
                const isExpanded = expanded.has(project.id);
                const { done, total } = project.progress;
                const pct = total > 0 ? (done / total) * 100 : 0;
                const overduePaymentCount = project.documents.filter(isOverduePayment).length;

                return (
                  <div key={project.id} className="mb-1">
                    <div className="group cursor-pointer rounded-lg bg-gray-50/80 px-4 py-3 transition-colors hover:bg-gray-100/70" style={{ display: "grid", gridTemplateColumns: PROJECT_COL_TEMPLATE, alignItems: "center" }} onClick={() => toggleExpand(project.id)}>
                      <ChevronDown className={cn("h-4 w-4 flex-shrink-0 text-gray-400 transition-transform", !isExpanded && "-rotate-90")} />
                      <span className="truncate text-sm font-semibold text-gray-900">{project.client}</span>
                      <span className="text-sm font-medium text-gray-700">{project.code}</span>
                      <span className="text-sm text-gray-500">{getMonthOnly(project.period)}</span>
                      <span className="text-sm text-gray-500">{project.direction}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold" style={{background: 'var(--bg-accent)', color: 'var(--text-accent)'}}>{project.kam.initials}</div>
                        <span className="truncate text-sm text-gray-600">{project.kam.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold" style={{background: 'var(--fill-control)', color: 'var(--text-secondary)'}}>{project.doManager.initials}</div>
                        <span className="truncate text-sm text-gray-600">{project.doManager.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-gray-500">{done}/{total}</span>
                      </div>
                      {overduePaymentCount > 0 ? (
                        <div className="flex items-center justify-center">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-red-500"><AlertTriangle className="h-2.5 w-2.5" /></span>
                        </div>
                      ) : <div />}
                      <span className="text-sm font-semibold tabular-nums text-gray-900">{fmt(project.sum)}</span>
                      <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-60" />
                    </div>

                    {isExpanded && docs.length > 0 && (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDocDragEnd}>
                        <SortableContext items={docs.map((d) => `${project.id}-${d.id}`)} strategy={verticalListSortingStrategy}>
                          <div className="mt-1 w-full">
                            <div className="sticky top-0 z-20 bg-white">
                              <div className="grid text-[10px] uppercase tracking-wider text-gray-400" style={{ gridTemplateColumns: DOC_COL_TEMPLATE, alignItems: "center" }}>
                                <span className="pl-3">&nbsp;</span>
                                <span className="px-3 py-2 font-medium">Type</span>
                                <span className="px-3 py-2 font-medium">Status</span>
                                <span className="px-3 py-2 text-right font-medium">Amount</span>
                                <span className="px-3 py-2 font-medium">Doc No.</span>
                                <span className="px-3 py-2 font-medium">Payment Plan</span>
                                <span className="px-3 py-2 font-medium">Payment Fact</span>
                                <span className="px-3 py-2 font-medium">Estimate</span>
                                <span className="px-3 py-2 font-medium">Comment</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {docs.map((doc) => (
                                <SortableDocRow key={doc.id} doc={doc} projectId={project.id} onStatusChange={handleStatusChange} onCommentChange={handleCommentChange} />
                              ))}
                            </div>
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}

                    {isExpanded && (
                      <div className="pb-2 pl-8 pt-1">
                        <button className="py-1 text-xs text-gray-400 transition-colors hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}>
                          + Add document
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {aiOpen ? (
        <AIPanel onClose={() => setAiOpen(false)} />
      ) : (
        <button onClick={() => setAiOpen(true)} className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50">AI</button>
      )}
    </div>
  );
}

export default ClientsPage;
