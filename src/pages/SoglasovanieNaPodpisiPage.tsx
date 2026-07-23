import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SidePanel } from "@/components/base/SidePanel";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/docUtils";
import { CurrentUser } from "@/types";
import { useSoglasovanieDocuments, signDocuments } from "@/hooks/useSoglasovanieDocuments";
import { DocDirection, DocType, SoglasovanieDocument, getContragentName, getResponsibleName } from "@/data/soglasovanie-seed";

interface SoglasovanieNaPodpisiPageProps {
  currentUser: CurrentUser;
}

// R6: цвета и текст бейджа "Направление".
const DIRECTION_BADGE: Record<DocDirection, { label: string; bg: string; color: string }> = {
  clients: { label: "Клиент", bg: "#E0F2FE", color: "#0284C7" },
  contractors_client: { label: "Подрядчик · клиент", bg: "#FEF3C7", color: "#B45309" },
  contractors_internal: { label: "Подрядчик · внутр.", bg: "#EDE9FE", color: "#6D28D9" },
};

// R25 (Ревизия 1): полный каталог типов документов для дропдауна «Тип» — по
// аналогии с фиксированным списком на странице Клиенты, не зависит от того,
// какие типы реально присутствуют в очереди на текущий момент.
const FULL_DOC_TYPE_LIST: DocType[] = ["Договор", "Приложение", "Счёт", "УПД", "Акт", "СФ"];

function pluralizeDocuments(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "документ";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "документа";
  return "документов";
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "—";
  const [y, m, d] = deadline.split("-");
  return `${d}.${m}.${y}`;
}

// [чекбокс] | Документ | Направление | Контрагент | Ответственный | Сумма | Подписать до | [действие]
// R24: "Документ" ограничен по максимуму (не тянется на всю ширину) — "Направление"
// стоит визуально ближе к названию. R23: "Подписать до" и колонка действия — фиксированной
// ширины (не minmax с growth), чтобы просроченный текст никогда не наезжал на кнопку.
const COL_TEMPLATE = "36px minmax(160px,220px) 168px minmax(120px,1fr) minmax(140px,1fr) 120px 150px 132px";

export function SoglasovanieNaPodpisiPage({ currentUser }: SoglasovanieNaPodpisiPageProps) {
  const documents = useSoglasovanieDocuments();

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [contractorClientFilter, setContractorClientFilter] = useState("");
  const [contractorInternalFilter, setContractorInternalFilter] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [sortBy, setSortBy] = useState<"queuedAt" | "deadline">("queuedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedDocument, setSelectedDocument] = useState<SoglasovanieDocument | null>(null);
  const [signTargetIds, setSignTargetIds] = useState<string[] | null>(null);

  // R4: единый список — все направления одновременно, без вкладок/страниц.
  const queue = useMemo(
    () => documents.filter((d) => d.stage === "sign_us" && d.assignedTo === currentUser.id),
    [documents, currentUser.id]
  );

  const clientOptions = useMemo(
    () => Array.from(new Set(queue.filter((d) => d.direction === "clients").map((d) => getContragentName(d)))),
    [queue]
  );
  const contractorClientOptions = useMemo(
    () => Array.from(new Set(queue.filter((d) => d.direction === "contractors_client").map((d) => getContragentName(d)))),
    [queue]
  );
  const contractorInternalOptions = useMemo(
    () => Array.from(new Set(queue.filter((d) => d.direction === "contractors_internal").map((d) => getContragentName(d)))),
    [queue]
  );
  const responsibleOptions = useMemo(() => Array.from(new Set(queue.map((d) => getResponsibleName(d.responsibleId)))), [queue]);

  // R9: три дропдауна направления взаимоисключающие.
  const handleClientFilter = (value: string) => {
    setClientFilter(value);
    setContractorClientFilter("");
    setContractorInternalFilter("");
  };
  const handleContractorClientFilter = (value: string) => {
    setContractorClientFilter(value);
    setClientFilter("");
    setContractorInternalFilter("");
  };
  const handleContractorInternalFilter = (value: string) => {
    setContractorInternalFilter(value);
    setClientFilter("");
    setContractorClientFilter("");
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return queue.filter((doc) => {
      if (clientFilter && (doc.direction !== "clients" || getContragentName(doc) !== clientFilter)) return false;
      if (contractorClientFilter && (doc.direction !== "contractors_client" || getContragentName(doc) !== contractorClientFilter)) return false;
      if (contractorInternalFilter && (doc.direction !== "contractors_internal" || getContragentName(doc) !== contractorInternalFilter)) return false;
      if (responsibleFilter && getResponsibleName(doc.responsibleId) !== responsibleFilter) return false;
      if (typeFilter && doc.type !== typeFilter) return false;
      if (q) {
        const haystack = `${doc.name} ${getContragentName(doc)}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [queue, search, clientFilter, contractorClientFilter, contractorInternalFilter, responsibleFilter, typeFilter]);

  // R11/R12: по умолчанию — queuedAt по возрастанию; клик по заголовку "Подписать
  // до" переключает сортировку на deadline (повторный клик — смена направления).
  const sortedRows = useMemo(() => {
    const arr = [...filteredRows];
    arr.sort((a, b) => {
      const av = sortBy === "queuedAt" ? a.queuedAt ?? "" : a.deadline ?? "9999-99-99";
      const bv = sortBy === "queuedAt" ? b.queuedAt ?? "" : b.deadline ?? "9999-99-99";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredRows, sortBy, sortDir]);

  const handleDeadlineHeaderClick = () => {
    if (sortBy !== "deadline") {
      setSortBy("deadline");
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  // R16: "выбрать всё" не отмечает строки с замечанием юриста.
  const selectableRows = sortedRows.filter((d) => !d.hasLawyerNote);
  const allSelectableChecked = selectableRows.length > 0 && selectableRows.every((d) => selectedIds.has(d.id));

  const toggleSelectAll = () => {
    setSelectedIds(allSelectableChecked ? new Set() : new Set(selectableRows.map((d) => d.id)));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedSum = useMemo(
    () => queue.filter((d) => selectedIds.has(d.id)).reduce((sum, d) => sum + (d.amount ?? 0), 0),
    [queue, selectedIds]
  );

  const signTargetDocs = useMemo(
    () => (signTargetIds ? queue.filter((d) => signTargetIds.includes(d.id)) : []),
    [queue, signTargetIds]
  );

  // R18: подписание — stage → signed через общий стор (см. useSoglasovanieDocuments),
  // строка(и) пропадают из очереди, карточка на канбане "Документы" уходит в "Подписан".
  const confirmSign = () => {
    if (!signTargetIds) return;
    signDocuments(signTargetIds);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      signTargetIds.forEach((id) => next.delete(id));
      return next;
    });
    setSignTargetIds(null);
  };

  const hasAnyFilter = !!(search || clientFilter || contractorClientFilter || contractorInternalFilter || responsibleFilter || typeFilter);

  const resetFilters = () => {
    setSearch("");
    setClientFilter("");
    setContractorClientFilter("");
    setContractorInternalFilter("");
    setResponsibleFilter("");
    setTypeFilter("");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">На подписи</h1>
        {hasAnyFilter && (
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={resetFilters}>
            <span className="mr-1">×</span> Сбросить
          </Button>
        )}
      </div>

      <div className="px-8 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск…"
              className="h-9 w-52 border-gray-200 bg-gray-50 pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", clientFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {clientFilter || "Клиенты"} <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleClientFilter("")}>Все</DropdownMenuItem>
              {clientOptions.map((o) => (
                <DropdownMenuItem key={o} onClick={() => handleClientFilter(o)}>{o}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", contractorClientFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {contractorClientFilter || "Подрядчики · клиенты"} <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleContractorClientFilter("")}>Все</DropdownMenuItem>
              {contractorClientOptions.map((o) => (
                <DropdownMenuItem key={o} onClick={() => handleContractorClientFilter(o)}>{o}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", contractorInternalFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {contractorInternalFilter || "Подрядчики · внутр."} <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleContractorInternalFilter("")}>Все</DropdownMenuItem>
              {contractorInternalOptions.map((o) => (
                <DropdownMenuItem key={o} onClick={() => handleContractorInternalFilter(o)}>{o}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", responsibleFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {responsibleFilter || "Ответственный"} <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setResponsibleFilter("")}>Все</DropdownMenuItem>
              {responsibleOptions.map((o) => (
                <DropdownMenuItem key={o} onClick={() => setResponsibleFilter(o)}>{o}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", typeFilter && "text-blue-700 border-blue-300 bg-blue-50")}>
                {typeFilter || "Тип"} <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter("")}>Все типы</DropdownMenuItem>
              {FULL_DOC_TYPE_LIST.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>{t}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
          <div className="py-2" style={{ display: "grid", gridTemplateColumns: COL_TEMPLATE, alignItems: "center" }}>
            <div className="flex items-center justify-center">
              <Checkbox checked={allSelectableChecked} onCheckedChange={toggleSelectAll} disabled={selectableRows.length === 0} />
            </div>
            <span className="px-3 text-xs font-medium uppercase tracking-wide text-gray-400">Документ</span>
            <span className="px-3 text-xs font-medium uppercase tracking-wide text-gray-400">Направление</span>
            <span className="px-3 text-xs font-medium uppercase tracking-wide text-gray-400">Контрагент</span>
            <span className="px-3 text-xs font-medium uppercase tracking-wide text-gray-400">Ответственный</span>
            <span className="px-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Сумма</span>
            <button
              type="button"
              className="flex items-center gap-1 px-3 text-xs font-medium uppercase tracking-wide text-gray-400 transition-colors hover:text-gray-600"
              onClick={handleDeadlineHeaderClick}
            >
              Подписать до
              {sortBy === "deadline" && (sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
            </button>
            <div />
          </div>
        </div>

        {sortedRows.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            По выбранным фильтрам документов не найдено.
          </div>
        ) : (
          <div className="mt-1">
            {sortedRows.map((doc) => {
              const isChecked = selectedIds.has(doc.id);
              const badge = DIRECTION_BADGE[doc.direction];
              const isOverdue = doc.overdueByDays > 0;
              return (
                <div
                  key={doc.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDocument(doc)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedDocument(doc);
                  }}
                  className="group cursor-pointer rounded-lg border border-transparent transition-colors hover:border-gray-200 hover:bg-gray-50"
                  style={{ display: "grid", gridTemplateColumns: COL_TEMPLATE, alignItems: "center" }}
                >
                  <div className="flex items-center justify-center py-2.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={isChecked} onCheckedChange={() => toggleRow(doc.id)} />
                  </div>
                  <div className="min-w-0 truncate px-3 py-2.5 text-sm font-medium text-gray-900">{doc.name}</div>
                  <div className="px-3 py-2.5">
                    <span
                      className="inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="min-w-0 truncate px-3 py-2.5 text-sm text-gray-700">{getContragentName(doc)}</div>
                  <div className="min-w-0 truncate px-3 py-2.5 text-sm text-gray-600">{getResponsibleName(doc.responsibleId)}</div>
                  <div className="px-3 py-2.5 text-right text-sm font-medium tabular-nums text-gray-900">{fmt(doc.amount)}</div>
                  <div className="min-w-0 px-3 py-2.5 text-sm">
                    <span className={cn("whitespace-nowrap text-gray-600", isOverdue && "font-semibold text-red-500")}>{formatDeadline(doc.deadline)}</span>
                    {isOverdue && <span className="block text-[11px] text-red-500">+{doc.overdueByDays} дн.</span>}
                  </div>
                  <div className="min-w-0 px-3 py-2.5">
                    {!isChecked && (
                      <Button
                        size="sm"
                        className="h-8 min-w-[100px] text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSignTargetIds([doc.id]);
                        }}
                      >
                        Подписать
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="sticky bottom-0 z-20 -mx-8 mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <span className="text-sm font-medium text-gray-700">
              Выбрано {selectedIds.size} · {fmt(selectedSum)}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast("Возврат с вопросом — функция в разработке")}>
                Вернуть с вопросом
              </Button>
              <Button size="sm" onClick={() => setSignTargetIds(Array.from(selectedIds))}>
                Подписать выбранные · {selectedIds.size}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={signTargetIds != null}
        onOpenChange={(open) => {
          if (!open) setSignTargetIds(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {signTargetDocs.length === 1
                ? `Подписать «${signTargetDocs[0]?.name}»?`
                : `Подписать ${signTargetDocs.length} ${pluralizeDocuments(signTargetDocs.length)}?`}
            </DialogTitle>
            <DialogDescription>Сертификат: Иванов И.И. (ООО «Компания»), действителен до 31.12.2026</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignTargetIds(null)}>Отмена</Button>
            <Button onClick={confirmSign}>Подписать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SidePanel title={selectedDocument?.name ?? ""} open={selectedDocument != null} onClose={() => setSelectedDocument(null)}>
        {selectedDocument && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Направление</span>
              <span className="font-medium text-gray-900">{DIRECTION_BADGE[selectedDocument.direction].label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Контрагент</span>
              <span className="font-medium text-gray-900">{getContragentName(selectedDocument)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ответственный</span>
              <span className="font-medium text-gray-900">{getResponsibleName(selectedDocument.responsibleId)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Сумма</span>
              <span className="font-medium text-gray-900">{fmt(selectedDocument.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Подписать до</span>
              <span className="font-medium text-gray-900">{formatDeadline(selectedDocument.deadline)}</span>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}

export default SoglasovanieNaPodpisiPage;
