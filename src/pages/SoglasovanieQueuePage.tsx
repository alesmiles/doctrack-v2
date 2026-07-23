import { useMemo, useState } from "react";
import { ChevronDown, Search, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { SidePanel } from "@/components/base/SidePanel";
import { SoglasovanieQueueRow, QUEUE_ROW_GRID } from "@/components/SoglasovanieQueueRow";
import { cn } from "@/lib/utils";
import { BASE_CLIENTS } from "@/mocks/baseClients";
import { BASE_CONTRACTORS } from "@/mocks/baseContractors";
import {
  CLIENT_STATUS_LABELS,
  CONTRACTOR_STATUS_LABELS,
  DIRECTION_LABELS,
  LEGAL_QUEUE_DOCUMENTS,
  LegalQueueDirection,
  LegalQueueDocument,
  StatusAction,
  TODAY_ISO,
  getAvailableActions,
  isTerminalStatus,
} from "@/data/soglasovanie-legal-queue";

// Доработка «фильтры»: список значений фильтра «Документ» — фиксированный
// набор видов документа (не путать с «Тип» = Первичный/С правками), задан
// буквально по ТЗ.
const DOCUMENT_KIND_OPTIONS = ["Договор", "Акт", "УПД", "Счёт", "Приложение"];

// R (доработка 5, второй промпт): «Статус» больше не отдельная колонка
// таблицы — см. SoglasovanieQueueRow (подпись «ждём клиента» переехала под
// «Дедлайн»); поле status и переходы по нему не тронуты, статус виден в SidePanel.
// R (доработка «убрать чекбоксы»): колонка чекбоксов удалена — «Документ»
// теперь первая колонка.
const COLUMN_LABELS = ["Документ", "Тип", "Направление", "Контрагент", "Ответственный", "Дедлайн"];

type TypeFilter = "" | "primary" | "revised";

function sortByDeadline(docs: LegalQueueDocument[]): LegalQueueDocument[] {
  return [...docs].sort((a, b) => {
    if (a.deadline == null && b.deadline == null) return 0;
    if (a.deadline == null) return 1;
    if (b.deadline == null) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

function statusLabel(doc: LegalQueueDocument): string {
  return doc.direction === "client"
    ? CLIENT_STATUS_LABELS[doc.status as keyof typeof CLIENT_STATUS_LABELS]
    : CONTRACTOR_STATUS_LABELS[doc.status as keyof typeof CONTRACTOR_STATUS_LABELS];
}

export function SoglasovanieQueuePage() {
  const [documents, setDocuments] = useState<LegalQueueDocument[]>(LEGAL_QUEUE_DOCUMENTS);
  const [selected, setSelected] = useState<LegalQueueDocument | null>(null);

  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<LegalQueueDirection | "">("");
  const [contragentFilter, setContragentFilter] = useState("");
  const [contragentPopoverOpen, setContragentPopoverOpen] = useState(false);
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [documentKindFilter, setDocumentKindFilter] = useState("");
  // Доработка 5: терминальные строки скрыты, пока тумблер не включён.
  const [showCompleted, setShowCompleted] = useState(false);

  // Доработка «фильтры», п.2: список «Контрагент» — из справочника
  // База → Клиенты/Подрядчики (не из значений, встречающихся в самой
  // очереди), сужается текущим фильтром «Направление».
  const contragentOptions = useMemo(() => {
    if (directionFilter === "client") return BASE_CLIENTS.map((c) => c.company);
    if (directionFilter === "contractor") return BASE_CONTRACTORS.map((c) => c.company);
    return [...BASE_CLIENTS.map((c) => c.company), ...BASE_CONTRACTORS.map((c) => c.company)];
  }, [directionFilter]);

  const handleDirectionChange = (next: LegalQueueDirection | "") => {
    setDirectionFilter(next);
    // Список контрагентов зависит от направления — старый выбор мог
    // относиться к другому справочнику (клиенты vs подрядчики).
    setContragentFilter("");
  };

  // Доработка 2: "Ответственный" — список пользователей с ролью «Юрист».
  // В демо-данных приложения (src/mocks/users.ts) роль "lawyer" имеет только
  // один пользователь — этого недостаточно для содержательного фильтра.
  // Т.к. вся очередь по определению ТЗ — это работа юриста, опции фильтра
  // взяты как уникальные значения поля "Ответственный" по самой очереди
  // (см. допущение в IMPLEMENTATION_REPORT.md), а не строго по DEMO_USERS.
  const responsibleOptions = useMemo(
    () => Array.from(new Set(documents.map((d) => d.responsible))),
    [documents]
  );

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      if (!showCompleted && isTerminalStatus(doc)) return false;
      if (directionFilter && doc.direction !== directionFilter) return false;
      if (contragentFilter && doc.counterparty !== contragentFilter) return false;
      if (responsibleFilter && doc.responsible !== responsibleFilter) return false;
      if (typeFilter === "primary" && doc.revisionRound !== 0) return false;
      if (typeFilter === "revised" && doc.revisionRound === 0) return false;
      if (documentKindFilter && doc.docType !== documentKindFilter) return false;
      if (q) {
        const haystack = `${doc.name} ${doc.counterparty}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [documents, search, directionFilter, contragentFilter, responsibleFilter, typeFilter, documentKindFilter, showCompleted]);

  const sorted = useMemo(() => sortByDeadline(filteredDocuments), [filteredDocuments]);

  // Доработка «фильтры», п.4: «Сбросить» учитывает ровно 5 названных в ТЗ
  // фильтров (Направление/Контрагент/Ответственный/Тип/Документ) — Поиск и
  // тумблер «Показывать завершённые» в их число не входят, ТЗ их не называет.
  const hasAnyFilter = !!(directionFilter || contragentFilter || responsibleFilter || typeFilter || documentKindFilter);

  const resetFilters = () => {
    setDirectionFilter("");
    setContragentFilter("");
    setResponsibleFilter("");
    setTypeFilter("");
    setDocumentKindFilter("");
  };

  // Доработка 4: переход статуса — единственный способ его поменять, вызывается
  // только из действий боковой панели (кнопки из getAvailableActions).
  const handleTransition = (id: string, action: StatusAction) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const next: LegalQueueDocument = { ...d, status: action.targetStatus };
        if (action.targetStatus === "waiting_client") {
          next.waitingSince = TODAY_ISO;
        } else if (d.status === "waiting_client" && action.targetStatus === "in_progress") {
          // Получены правки от клиента — новый раунд, ожидание закончилось.
          next.revisionRound = d.revisionRound + 1;
          next.waitingSince = null;
        }
        return next;
      })
    );
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: action.targetStatus } : prev));
  };

  const selectedActions = selected ? getAvailableActions(selected) : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Согласование</h1>
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

          {/* Порядок кнопок фильтров зафиксирован ТЗ: Направление → Контрагент →
              Ответственный → Тип → Документ → ⚙️ */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("h-9 border-gray-200 bg-gray-50 text-sm", directionFilter && "text-blue-700 border-blue-300 bg-blue-50")}
              >
                {directionFilter ? DIRECTION_LABELS[directionFilter] : "Направление"}
                <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDirectionChange("")}>Все</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDirectionChange("client")}>Клиент</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDirectionChange("contractor")}>Подрядчик</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Контрагент — выпадающий список с поиском (Popover + Command),
              значения из справочника База → Клиенты/Подрядчики. */}
          <Popover open={contragentPopoverOpen} onOpenChange={setContragentPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={contragentPopoverOpen}
                size="sm"
                className={cn("h-9 border-gray-200 bg-gray-50 text-sm justify-between", contragentFilter && "text-blue-700 border-blue-300 bg-blue-50")}
              >
                <span className="truncate">{contragentFilter || "Контрагент"}</span>
                <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandInput placeholder="Поиск контрагента…" className="h-9 text-sm" />
                <CommandList>
                  <CommandEmpty>Не найдено</CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="Все" onSelect={() => { setContragentFilter(""); setContragentPopoverOpen(false); }}>
                      Все
                    </CommandItem>
                    {contragentOptions.map((name) => (
                      <CommandItem key={name} value={name} onSelect={() => { setContragentFilter(name); setContragentPopoverOpen(false); }}>
                        {name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("h-9 border-gray-200 bg-gray-50 text-sm", responsibleFilter && "text-blue-700 border-blue-300 bg-blue-50")}
              >
                {responsibleFilter || "Ответственный"}
                <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setResponsibleFilter("")}>Все</DropdownMenuItem>
              {responsibleOptions.map((name) => (
                <DropdownMenuItem key={name} onClick={() => setResponsibleFilter(name)}>{name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("h-9 border-gray-200 bg-gray-50 text-sm", typeFilter && "text-blue-700 border-blue-300 bg-blue-50")}
              >
                {typeFilter === "primary" ? "Первичный" : typeFilter === "revised" ? "С правками" : "Тип"}
                <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter("")}>Все</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("primary")}>Первичный</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("revised")}>С правками</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Документ — вид документа (Договор/Акт/УПД/Счёт/Приложение), не
              путать с «Тип» (Первичный/С правками). */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("h-9 border-gray-200 bg-gray-50 text-sm", documentKindFilter && "text-blue-700 border-blue-300 bg-blue-50")}
              >
                {documentKindFilter || "Документ"}
                <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDocumentKindFilter("")}>Все</DropdownMenuItem>
              {DOCUMENT_KIND_OPTIONS.map((kind) => (
                <DropdownMenuItem key={kind} onClick={() => setDocumentKindFilter(kind)}>{kind}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 flex-shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-600"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-gray-400">Настройки фильтров</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={showCompleted} onCheckedChange={() => setShowCompleted((v) => !v)}>
                Показывать завершённые
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasAnyFilter && (
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={resetFilters}>
              <X className="w-3.5 h-3.5 mr-1" />
              Сбросить
            </Button>
          )}
        </div>
      </div>

      <div className="px-8 pb-8">
        <div
          className="grid px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-white"
          style={{ gridTemplateColumns: QUEUE_ROW_GRID }}
        >
          {COLUMN_LABELS.map((label, i) => (
            <div key={i} className="px-3">{label}</div>
          ))}
        </div>

        <div className="flex flex-col gap-0.5 pt-1">
          {sorted.map((doc) => (
            <SoglasovanieQueueRow key={doc.id} doc={doc} onOpen={setSelected} />
          ))}
          {sorted.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">Очередь пуста</div>
          )}
        </div>
      </div>

      <SidePanel title={selected?.name ?? ""} open={selected != null} onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-900">{selected.name}</div>
              {selected.docType && <div className="text-xs text-gray-400 mt-0.5">{selected.docType}</div>}
              <div className="mt-3 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Направление</span>
                  <span className="text-gray-700">{DIRECTION_LABELS[selected.direction]}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Контрагент</span>
                  <span className="text-gray-700">{selected.counterparty}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Ответственный</span>
                  <span className="text-gray-700">{selected.responsible}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Статус</span>
                  <span
                    className={cn(
                      "font-medium",
                      selected.status === "approved" ? "text-emerald-700" : "text-gray-700"
                    )}
                  >
                    {statusLabel(selected)}
                  </span>
                </div>
              </div>

              {selectedActions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {selectedActions.map((action) => (
                    <Button
                      key={action.targetStatus}
                      size="sm"
                      variant={action.targetStatus === "approved" || action.targetStatus === "done" ? "default" : "outline"}
                      onClick={() => handleTransition(selected.id, action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">История правок</div>
              {selected.revisions.length === 0 ? (
                <p className="text-sm text-gray-400">Правок пока не было.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {selected.revisions.map((rev, i) => (
                    <div key={i} className="border-l-2 border-gray-200 pl-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{rev.date}</span>
                        <span>·</span>
                        <span className="font-medium text-gray-500">{rev.author}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{rev.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}

export default SoglasovanieQueuePage;
