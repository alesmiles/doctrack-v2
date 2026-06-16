import { useState, useCallback } from "react";
import { ArrowDown, ArrowUp, Search, ChevronDown, GripVertical, AlertTriangle, Settings } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableDocRow from "@/components/DocRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { computeProgress, computeSum, fmt, getMonthOnly, getYearOnly, isOverduePayment } from "../lib/docUtils";
import { PROJECT_COL_TEMPLATE, DOC_COL_TEMPLATE, MONTH_ORDER, STATUSES, CLIENT_DOC_TYPES, DOC_TYPE_ORDER, STATUS_COLORS } from "../constants";
import { Doc, Project } from "../types";
import { cn } from "@/lib/utils";
import AIPanel from "@/components/AIPanel";

export function ClientsPage() {
  const [projects, setProjects] = useState<Project[]>(() => RAW_PROJECTS.slice());
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));
  const [aiOpen, setAiOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [kamFilter, setKamFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [monthFilter, setMonthFilter] = useState("");
  const [monthSortDir, setMonthSortDir] = useState<null | "asc" | "desc">(null);
  const [doManagerFilter, setDoManagerFilter] = useState("");
  const [visibleFilters, setVisibleFilters] = useState({ direction: false, year: true, month: false, doManager: false, overdue: false });
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [deletedDocTypes, setDeletedDocTypes] = useState<Record<string, Set<string>>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const toggleFilter = (key: keyof typeof visibleFilters) => {
    const wasOn = visibleFilters[key];
    setVisibleFilters(prev => ({ ...prev, [key]: !prev[key] }));
    if (wasOn) {
      if (key === "direction") setDirectionFilter("");
      if (key === "year") setYearFilter("");
      if (key === "month") setMonthFilter("");
      if (key === "doManager") setDoManagerFilter("");
      if (key === "overdue") setShowOverdueOnly(false);
    }
  };

  const clientOptions = Array.from(new Set(projects.map((p) => p.client)));
  const kamOptions = Array.from(new Set(projects.map((p) => p.kam.name)));
  const doManagerOptions = Array.from(new Set(projects.map((p) => p.doManager.name)));
  const directionOptions = Array.from(new Set(projects.map((p) => p.direction)));
  const monthOptions = Array.from(new Set(projects.map((p) => getMonthOnly(p.period))));
  monthOptions.sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
  const yearOptions = Array.from(new Set(projects.map((p) => getYearOnly(p.period))))
    .sort((a, b) => Number(b) - Number(a));

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

  const hasAnyFilter = !!(search || clientFilter || kamFilter || docTypeFilter || statusFilter
    || (visibleFilters.direction && directionFilter)
    || (visibleFilters.year && yearFilter)
    || (visibleFilters.month && monthFilter)
    || (visibleFilters.doManager && doManagerFilter)
    || showOverdueOnly);

  const resetFilters = () => {
    setSearch(""); setClientFilter(""); setKamFilter(""); setDocTypeFilter(""); setStatusFilter("");
    setDirectionFilter(""); setYearFilter(""); setMonthFilter(""); setDoManagerFilter(""); setShowOverdueOnly(false);
  };

  const filteredProjects = projects.filter((p) => {
    if (clientFilter && p.client !== clientFilter) return false;
    if (kamFilter && p.kam.name !== kamFilter) return false;
    if (visibleFilters.doManager && doManagerFilter && p.doManager.name !== doManagerFilter) return false;
    if (visibleFilters.direction && directionFilter && p.direction !== directionFilter) return false;
    if (visibleFilters.year && yearFilter && getYearOnly(p.period) !== yearFilter) return false;
    if (visibleFilters.month && monthFilter && getMonthOnly(p.period) !== monthFilter) return false;
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

  const removeDocType = (type: string) => {
    setDeletedDocTypes((prev) => {
      const key = clientFilter || "__all__";
      const existing = prev[key] ?? new Set<string>();
      return { ...prev, [key]: new Set([...existing, type]) };
    });
    if (docTypeFilter === type) setDocTypeFilter("");
  };

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
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        {hasAnyFilter && (
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={resetFilters}>
            <span className="mr-1">×</span> Reset all
          </Button>
        )}
      </div>

      <div className="px-8 pb-3">
        <div className="flex items-center gap-2 flex-wrap">

          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-52"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", clientFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {clientFilter || "Client"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setClientFilter("")}>All clients</DropdownMenuItem>
              {clientOptions.map(c => <DropdownMenuItem key={c} onClick={() => setClientFilter(c)}>{c}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", kamFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {kamFilter || "KAM"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setKamFilter("")}>All KAMs</DropdownMenuItem>
              {kamOptions.map(k => <DropdownMenuItem key={k} onClick={() => setKamFilter(k)}>{k}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", docTypeFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {docTypeFilter || "Doc Type"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setDocTypeFilter("")}>All types</DropdownMenuItem>
              {activeDocTypes.map(t => (
                <div key={t} className="flex items-center justify-between pr-1 pl-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded-sm" onClick={() => setDocTypeFilter(t)}>
                  <span>{t}</span>
                  <button className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); removeDocType(t); }} onMouseDown={(e) => e.stopPropagation()}><span>×</span></button>
                </div>
              ))}
              {getAvailableToAdd().length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-gray-400">Add</DropdownMenuLabel>
                  {getAvailableToAdd().map(t => (
                    <DropdownMenuItem key={t} className="text-gray-400" onClick={() => restoreDocType(t)}>
                      <span className="mr-1">+</span> {t}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", statusFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {statusFilter || "Status"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("")}>All statuses</DropdownMenuItem>
              {STATUSES.map(s => (
                <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: (STATUS_COLORS as any)?.[s] ?? "#999" }} />{s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {visibleFilters.direction && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", directionFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {directionFilter || "Direction"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDirectionFilter("")}>All directions</DropdownMenuItem>
                {directionOptions.map(d => <DropdownMenuItem key={d} onClick={() => setDirectionFilter(d)}>{d}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleFilters.year && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", yearFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {yearFilter || "Year"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setYearFilter("")}>All years</DropdownMenuItem>
                {yearOptions.map(y => <DropdownMenuItem key={y} onClick={() => setYearFilter(y)}>{y}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleFilters.month && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", monthFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {monthFilter || "Month"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setMonthFilter("")}>All months</DropdownMenuItem>
                {monthOptions.map(m => <DropdownMenuItem key={m} onClick={() => setMonthFilter(m)}>{m}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleFilters.doManager && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", doManagerFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                  {doManagerFilter || "Doc Manager"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDoManagerFilter("")}>All</DropdownMenuItem>
                {doManagerOptions.map(d => <DropdownMenuItem key={d} onClick={() => setDoManagerFilter(d)}>{d}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleFilters.overdue && (
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9 text-sm bg-gray-50 border-gray-200", showOverdueOnly && "text-red-700 border-red-300 bg-red-50")}
              onClick={() => setShowOverdueOnly(o => !o)}
            >
              Overdue
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 flex-shrink-0">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-gray-400">Filter settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["direction", "year", "month", "doManager", "overdue"] as Array<keyof typeof visibleFilters>).map((key) => {
                const labels: Record<keyof typeof visibleFilters, string> = {
                  direction: "Direction", year: "Year", month: "Month", doManager: "Doc Manager", overdue: "Overdue",
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
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="px-8 py-2" style={{ display: "grid", gridTemplateColumns: PROJECT_COL_TEMPLATE, alignItems: "center" }}>
            <div className="w-4" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Client</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Project ID</span>
            <button type="button" className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider transition-colors hover:text-gray-600" onClick={() => setMonthSortDir(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null)}>
              Month
              {monthSortDir === "asc" && <ArrowUp className="w-3.5 h-3.5" />}
              {monthSortDir === "desc" && <ArrowDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Direction</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">KAM</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Doc Manager</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Amount</span>
            <div className="w-6" />
          </div>
        </div>

        <div className="px-8 pt-2">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <Search className="w-10 h-10 text-gray-300" />
              <div>
                <p className="text-gray-700 font-medium text-base">No results found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
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
                  <div className="px-4 py-3 bg-gray-50/80 rounded-lg cursor-pointer hover:bg-gray-100/70 transition-colors group" style={{ display: "grid", gridTemplateColumns: PROJECT_COL_TEMPLATE, alignItems: "center" }} onClick={() => toggleExpand(project.id)}>
                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform flex-shrink-0", !isExpanded && "-rotate-90")} />
                    <span className="font-semibold text-sm text-gray-900 truncate">{project.client}</span>
                    <span className="text-sm text-gray-700 font-medium">{project.code}</span>
                    <span className="text-sm text-gray-500">{getMonthOnly(project.period)}</span>
                    <span className="text-sm text-gray-500">{project.direction}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0">{project.kam.initials}</div>
                      <span className="text-sm text-gray-600 truncate">{project.kam.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0">{project.doManager.initials}</div>
                      <span className="text-sm text-gray-600 truncate">{project.doManager.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums">{done}/{total}</span>
                    </div>
                    {overduePaymentCount > 0 ? (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center h-5 w-5 text-red-500 bg-red-50 rounded-full"><AlertTriangle className="w-2.5 h-2.5" /></span>
                      </div>
                    ) : <div />}
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(project.sum)}</span>
                    <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                  </div>

                  {isExpanded && docs.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDocDragEnd}>
                      <SortableContext items={docs.map((d) => `${project.id}-${d.id}`)} strategy={verticalListSortingStrategy}>
                        <div className="w-full mt-1">
                          <div className="sticky top-0 z-20 bg-white">
                            <div className="grid text-[10px] uppercase text-gray-400 tracking-wider" style={{ gridTemplateColumns: DOC_COL_TEMPLATE, alignItems: "center" }}>
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
                    <div className="pl-8 pt-1 pb-2">
                      <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors py-1" onClick={(e) => { e.stopPropagation(); console.log("add doc", project.id); }}>
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

      {aiOpen ? (
        <AIPanel onClose={() => setAiOpen(false)} />
      ) : (
        <button onClick={() => setAiOpen(true)} className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50">AI</button>
      )}
    </div>
  );
}

export default ClientsPage;

// ─── RAW_PROJECTS data ────────────────────────────────────────────────────────
const RAW_PROJECTS = [
  {
    id: 1, client: "Yandex", code: "YAN-1", period: "March 2026", direction: "Media",
    kam: { initials: "KP", name: "Kirill P.", color: "bg-slate-400" },
    doManager: { initials: "IM", name: "Inna M.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 4500000, link: "12", datePlan: "01.02.2026", dateFact: "28.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Annex", status: "Signed ORIG", sum: 4500000, link: "13", datePlan: "01.02.2026", dateFact: "30.01.2026", estimate: 4200000, comment: "", createdAt: "22.01.2026" },
      { id: 3, type: "Invoice", status: "Sent EDO", sum: 4500000, link: "201", datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "", createdAt: "15.02.2026" },
      { id: 4, type: "UPD", status: "Not Created", sum: null, link: null, datePlan: "15.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 5, type: "Act", status: "Not Created", sum: null, link: null, datePlan: "31.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 2, client: "Yandex", code: "YAN-2", period: "April 2026", direction: "Influence",
    kam: { initials: "KP", name: "Kirill P.", color: "bg-slate-400" },
    doManager: { initials: "IM", name: "Inna M.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Under Review", sum: 2800000, link: null, datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "Awaiting client edits", createdAt: "25.05.2026" },
      { id: 2, type: "Annex", status: "Not Created", sum: null, link: null, datePlan: "10.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Invoice", status: "Not Created", sum: null, link: null, datePlan: "01.04.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 3, client: "Yandex", code: "YAN-3", period: "February 2026", direction: "Context",
    kam: { initials: "AS", name: "Alina S.", color: "bg-zinc-400" },
    doManager: { initials: "IM", name: "Inna M.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 1200000, link: "8", datePlan: "15.01.2026", dateFact: "14.01.2026", estimate: null, comment: "", createdAt: "10.01.2026" },
      { id: 2, type: "Annex", status: "Signed ORIG", sum: 3600000, link: "9", datePlan: "15.01.2026", dateFact: "15.01.2026", estimate: 3600000, comment: "", createdAt: "12.01.2026" },
      { id: 3, type: "Invoice", status: "Sent EDO", sum: 3600000, link: "210", datePlan: "25.05.2026", dateFact: null, estimate: null, comment: "", createdAt: "20.05.2026" },
      { id: 4, type: "Act", status: "Sent ORIG", sum: 3600000, link: "44", datePlan: "28.02.2026", dateFact: null, estimate: null, comment: "", createdAt: "01.06.2026" },
      { id: 5, type: "UPD", status: "Not Created", sum: null, link: null, datePlan: "01.02.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 4, client: "Sber", code: "SBR-1", period: "January 2026", direction: "Media",
    kam: { initials: "AS", name: "Alina S.", color: "bg-zinc-400" },
    doManager: { initials: "PV", name: "Polina V.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 8900000, link: "3", datePlan: "01.12.2025", dateFact: "28.11.2025", estimate: null, comment: "", createdAt: "20.11.2025" },
      { id: 2, type: "Annex", status: "Signed ORIG", sum: 8900000, link: "4", datePlan: "01.12.2025", dateFact: "30.11.2025", estimate: 8500000, comment: "", createdAt: "22.11.2025" },
      { id: 3, type: "Order", status: "Signed ORIG", sum: 8900000, link: "5", datePlan: "15.12.2025", dateFact: "14.12.2025", estimate: null, comment: "", createdAt: "10.12.2025" },
      { id: 4, type: "Act", status: "Signed EDO", sum: 8900000, link: "21", datePlan: "31.01.2026", dateFact: "30.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 5, type: "Principal Report", status: "Signed EDO", sum: null, link: "6", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 5, client: "Sber", code: "SBR-2", period: "March 2026", direction: "Influence",
    kam: { initials: "KP", name: "Kirill P.", color: "bg-slate-400" },
    doManager: { initials: "PV", name: "Polina V.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 6800000, link: "15", datePlan: "01.02.2026", dateFact: "29.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Annex", status: "Under Review", sum: 6800000, link: null, datePlan: "10.02.2026", dateFact: null, estimate: 6800000, comment: "Pending client signature", createdAt: "01.06.2026" },
      { id: 3, type: "Invoice", status: "Sent EDO", sum: 6800000, link: "305", datePlan: "01.06.2026", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 4, type: "Act", status: "Not Created", sum: null, link: null, datePlan: "31.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 6, client: "Sber", code: "SBR-3", period: "December 2025", direction: "TV",
    kam: { initials: "AS", name: "Alina S.", color: "bg-zinc-400" },
    doManager: { initials: "IM", name: "Inna M.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 15000000, link: "1", datePlan: "01.11.2025", dateFact: "30.10.2025", estimate: null, comment: "", createdAt: "20.10.2025" },
      { id: 2, type: "Order", status: "Signed ORIG", sum: 15000000, link: "2", datePlan: "15.11.2025", dateFact: "14.11.2025", estimate: null, comment: "", createdAt: "10.11.2025" },
      { id: 3, type: "Act", status: "Sent ORIG", sum: 15000000, link: "88", datePlan: "31.12.2025", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 4, type: "Principal Report", status: "Not Created", sum: null, link: null, datePlan: "31.12.2025", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 7, client: "Avito", code: "AVI-1", period: "February 2026", direction: "Influence",
    kam: { initials: "KP", name: "Kirill P.", color: "bg-slate-400" },
    doManager: { initials: "PV", name: "Polina V.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 6700000, link: "7", datePlan: "15.01.2026", dateFact: "14.01.2026", estimate: null, comment: "", createdAt: "10.01.2026" },
      { id: 2, type: "Annex", status: "Signed ORIG", sum: 6700000, link: "8", datePlan: "15.01.2026", dateFact: "15.01.2026", estimate: 6400000, comment: "", createdAt: "12.01.2026" },
      { id: 3, type: "Addendum", status: "Signed EDO", sum: null, link: "9", datePlan: "20.01.2026", dateFact: "19.01.2026", estimate: null, comment: "", createdAt: null },
      { id: 4, type: "Invoice", status: "Signed ORIG", sum: 6700000, link: "312", datePlan: "28.02.2026", dateFact: "27.02.2026", estimate: null, comment: "", createdAt: "20.02.2026" },
      { id: 5, type: "UPD", status: "Signed EDO", sum: 6700000, link: "41", datePlan: "28.02.2026", dateFact: "28.02.2026", estimate: null, comment: "", createdAt: null },
      { id: 6, type: "Act", status: "Signed EDO", sum: null, link: "18", datePlan: "28.02.2026", dateFact: "28.02.2026", estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 8, client: "Avito", code: "AVI-2", period: "March 2026", direction: "Media",
    kam: { initials: "AS", name: "Alina S.", color: "bg-zinc-400" },
    doManager: { initials: "IM", name: "Inna M.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 2100000, link: "19", datePlan: "01.02.2026", dateFact: "30.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Annex", status: "Under Review", sum: 2100000, link: null, datePlan: "10.02.2026", dateFact: null, estimate: 2100000, comment: "", createdAt: "29.05.2026" },
      { id: 3, type: "Invoice", status: "Not Created", sum: 2100000, link: null, datePlan: "20.05.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 4, type: "Addendum", status: "Under Review", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "30.05.2026" },
    ],
  },
  {
    id: 9, client: "Avito", code: "AVI-3", period: "April 2026", direction: "Context",
    kam: { initials: "KP", name: "Kirill P.", color: "bg-slate-400" },
    doManager: { initials: "PV", name: "Polina V.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Contract", status: "Not Created", sum: null, link: null, datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "Annex", status: "Not Created", sum: null, link: null, datePlan: "10.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 10, client: "Alfa-Bank TG", code: "ALF-8", period: "December 2025", direction: "Influence",
    kam: { initials: "KP", name: "Kirill P.", color: "bg-slate-400" },
    doManager: { initials: "IM", name: "Inna M.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Order", status: "Sent ORIG", sum: 200000000, link: "8", datePlan: "31.05.2025", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 2, type: "Addendum", status: "Signed EDO", sum: null, link: "1", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Principal Report", status: "Signed EDO", sum: null, link: "7", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 4, type: "Agency Contract", status: "Signed ORIG", sum: 190416190, link: null, datePlan: "31.12.2025", dateFact: "26.12.2025", estimate: null, comment: "", createdAt: "20.12.2025" },
      { id: 5, type: "Invoice", status: "Signed ORIG", sum: 3711472, link: "598", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 6, type: "Act", status: "Not Created", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 11, client: "Alfa-Bank TG", code: "ALF-9", period: "February 2026", direction: "Influence",
    kam: { initials: "KP", name: "Kirill P.", color: "bg-slate-400" },
    doManager: { initials: "IM", name: "Inna M.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Order", status: "Not Created", sum: null, link: null, datePlan: "27.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "Addendum", status: "Under Review", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "29.05.2026" },
      { id: 3, type: "Agency Contract", status: "Signed ORIG", sum: 190416190, link: null, datePlan: "27.03.2026", dateFact: "01.04.2026", estimate: null, comment: "OUT | Retargeting 2.0", createdAt: "20.03.2026" },
      { id: 4, type: "Invoice", status: "Sent EDO", sum: 2746446, link: "38", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
    ],
  },
  {
    id: 12, client: "Alfa-Bank TG", code: "ALF-10", period: "March 2026", direction: "Media",
    kam: { initials: "PV", name: "Polina V.", color: "bg-neutral-400" },
    doManager: { initials: "IM", name: "Inna M.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Agency Contract", status: "Not Created", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "Invoice", status: "Not Created", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Act", status: "Not Created", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
].map((p) => ({ ...p, progress: computeProgress(p.documents as Doc[]), sum: computeSum(p.documents as Doc[]) })) as Project[];
