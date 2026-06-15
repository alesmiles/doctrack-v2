import { useState, useMemo } from "react";
import { ChevronDown, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/docUtils";
import { computeOverdueDays, computePaymentStatus, PaymentStatus } from "@/lib/receivables";
import { RECEIVABLE_PROJECTS, ReceivableProject } from "@/mocks/receivables";
import { DynamicsTab } from "./DynamicsTab";

// ─── Grid templates (паттерн из «Клиентов») ──────────────────────────────────

// Шапка и строки групп: chevron | КЛИЕНТ | ID ПРОЕКТА | КАМ | НАПРАВЛЕНИЕ | СУММА
const GROUP_COL =
  "32px minmax(180px,26%) minmax(96px,10%) minmax(150px,14%) minmax(110px,11%) minmax(130px,12%)";

// Колонки раскрытых платежей
const PAYMENT_COL =
  "40px minmax(160px,18%) minmax(130px,14%) minmax(100px,11%) minmax(140px,14%) minmax(105px,10%) minmax(95px,10%) 1fr";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// due_soon намеренно отсутствует — в UI оно отображается как «Ожидается»
const STATUS_LABELS: Partial<Record<PaymentStatus, string>> = {
  paid: "Оплачено",
  overdue: "Просрочено",
  awaiting: "Ожидается",
};

function fmtMln(n: number): string {
  return (
    (n / 1_000_000).toLocaleString("ru-RU", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " млн ₽"
  );
}

// ─── KPI card base style (все 4 одинаковые — белый фон, серая рамка) ─────────

const PILL_BASE =
  "flex flex-col px-4 py-3 rounded-xl border border-gray-200 bg-white min-w-[190px] text-left";

// ─── Types & period constants ─────────────────────────────────────────────────

type KpiKey = "expected" | "overdue" | "collected";

// ─── Component ────────────────────────────────────────────────────────────────

export function ReceivablesPage() {
  const [activeTab, setActiveTab] = useState<"list" | "dynamics">("list");
  const [activeKpi, setActiveKpi] = useState<KpiKey | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [kamFilter, setKamFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");

  // ── Derived options ──────────────────────────────────────────────────────────
  const clientOptions = Array.from(new Set(RECEIVABLE_PROJECTS.map((p) => p.client)));
  const kamOptions = Array.from(
    new Set(RECEIVABLE_PROJECTS.flatMap((p) => p.payments.map((pay) => pay.responsible.name)))
  );
  const directionOptions = Array.from(new Set(RECEIVABLE_PROJECTS.map((p) => p.direction))).sort();

  // ── KPI aggregates из полного массива моков (не зависят от фильтров) ─────────
  const kpi = useMemo(() => {
    let overdueSum = 0;
    const overdueProjectIds = new Set<number>();

    for (const project of RECEIVABLE_PROJECTS) {
      for (const pay of project.payments) {
        if (computePaymentStatus(pay.planDate, pay.factDate) === "overdue") {
          overdueSum += pay.amount;
          overdueProjectIds.add(project.id);
        }
      }
    }

    return {
      overdueSum,
      overdueClientCount: overdueProjectIds.size,
    };
  }, []);

  // ── Filtered accordion groups ────────────────────────────────────────────────
  const filteredGroups = useMemo((): ReceivableProject[] => {
    return RECEIVABLE_PROJECTS.map((project) => {
      let payments = project.payments;

      payments = payments.filter((pay) => !pay.factDate);

      if (kamFilter) {
        payments = payments.filter((pay) => pay.responsible.name === kamFilter);
      }
      if (statusFilter) {
        payments = payments.filter(
          (pay) => computePaymentStatus(pay.planDate, pay.factDate) === statusFilter
        );
      }
      if (search) {
        const q = search.toLowerCase();
        payments = payments.filter(
          (pay) =>
            project.client.toLowerCase().includes(q) ||
            project.projectCode.toLowerCase().includes(q) ||
            pay.docRef.toLowerCase().includes(q) ||
            pay.description.toLowerCase().includes(q)
        );
      }

      return { ...project, payments };
    }).filter((p) => {
      if (clientFilter && p.client !== clientFilter) return false;
      if (directionFilter && p.direction !== directionFilter) return false;
      return p.payments.length > 0;
    });
  }, [search, clientFilter, kamFilter, directionFilter, statusFilter]);

  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleKpi = (key: KpiKey) =>
    setActiveKpi((prev) => (prev === key ? null : key));

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дебиторская задолженность</h1>
          <p className="text-xs text-gray-400 mt-1">
            Статусы обновляются автоматически из 1С · последняя синхронизация 11:24
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex-shrink-0 mt-1">
          Экспорт
        </Button>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 px-8">
        {(["list", "dynamics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5",
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "list" ? "Список" : "Динамика"}
            {tab === "dynamics" && (
              <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-100 text-blue-500 leading-none">
                demo
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Dynamics ────────────────────────────────────────────────────────── */}
      {activeTab === "dynamics" && <DynamicsTab />}

      {/* ── List ────────────────────────────────────────────────────────────── */}
      {activeTab === "list" && (
        <>
          {/* ── KPI pills — все белые, одинаковые; «Просрочено» и «В просрочке» вычисляются из моков ── */}
          <div className="flex flex-wrap gap-3 px-8 pb-4">

            {/* Ожидаемые поступления — TODO: период backend v2 */}
            <button
              onClick={() => toggleKpi("expected")}
              className={cn(
                PILL_BASE,
                "cursor-pointer hover:border-gray-300 transition-all",
                activeKpi === "expected" && "border-gray-300 shadow-sm"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#3B82F6' }} />
                <span className="text-xs text-gray-500">Ожидаемые поступления</span>
              </div>
              <div className="text-base font-semibold text-gray-900">31,0 млн ₽</div>
              {/* TODO: период-фильтрация — backend, v2 */}
            </button>

            {/* Просрочено — сумма вычисляется из моков, без красного акцента */}
            <button
              onClick={() => toggleKpi("overdue")}
              className={cn(
                PILL_BASE,
                "cursor-pointer hover:border-gray-300 transition-all",
                activeKpi === "overdue" && "border-gray-300 shadow-sm"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#EF4444' }} />
                <span className="text-xs text-gray-500">Просрочено</span>
              </div>
              <div className="text-base font-semibold text-gray-900">{fmtMln(kpi.overdueSum)}</div>
            </button>

            {/* В просрочке — кол-во уникальных клиентов вычисляется из моков; полоска убрана */}
            <div className={PILL_BASE}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#8B5CF6' }} />
                <span className="text-xs text-gray-500">В просрочке</span>
              </div>
              <div className="text-base font-semibold text-gray-900">
                {kpi.overdueClientCount}{" "}
                {kpi.overdueClientCount === 1 ? "клиент" : kpi.overdueClientCount < 5 ? "клиента" : "клиентов"}
              </div>
            </div>

            {/* Собрано за период — TODO: период backend v2 */}
            <button
              onClick={() => toggleKpi("collected")}
              className={cn(
                PILL_BASE,
                "cursor-pointer hover:border-gray-300 transition-all",
                activeKpi === "collected" && "border-gray-300 shadow-sm"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#22C55E' }} />
                <span className="text-xs text-gray-500">Собрано за период</span>
              </div>
              <div className="text-base font-semibold text-gray-900">
                18,6 / 31,0 млн{" "}
                <span className="text-xs font-normal text-emerald-600 ml-1">· 60%</span>
              </div>
              {/* TODO: период-фильтрация — backend, v2 */}
            </button>
          </div>

          {/* ── Filter bar — полный набор как в «Клиентах» ───────────────────── */}
          <div className="px-8 pb-3">
            <div className="flex items-center gap-2 flex-wrap">

              {/* Поиск — фиксированная ширина w-52 как в «Клиентах» */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск..."
                  className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-52"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Клиент */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline" size="sm"
                    className={cn("h-9 text-sm bg-gray-50 border-gray-200", clientFilter && "text-blue-700 border-blue-300 bg-blue-50")}
                  >
                    {clientFilter || "Клиент"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setClientFilter("")}>Все клиенты</DropdownMenuItem>
                  {clientOptions.map((c) => (
                    <DropdownMenuItem key={c} onClick={() => setClientFilter(c)}>{c}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* КАМ — всегда виден, как в «Клиентах» */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline" size="sm"
                    className={cn("h-9 text-sm bg-gray-50 border-gray-200", kamFilter && "text-blue-700 border-blue-300 bg-blue-50")}
                  >
                    {kamFilter || "КАМ"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setKamFilter("")}>Все КАМы</DropdownMenuItem>
                  {kamOptions.map((k) => (
                    <DropdownMenuItem key={k} onClick={() => setKamFilter(k)}>{k}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Направление — всегда виден, рабочий */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline" size="sm"
                    className={cn("h-9 text-sm bg-gray-50 border-gray-200", directionFilter && "text-blue-700 border-blue-300 bg-blue-50")}
                  >
                    {directionFilter || "Направление"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDirectionFilter("")}>Все направления</DropdownMenuItem>
                  {directionOptions.map((d) => (
                    <DropdownMenuItem key={d} onClick={() => setDirectionFilter(d)}>{d}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Статус */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline" size="sm"
                    className={cn("h-9 text-sm bg-gray-50 border-gray-200", statusFilter && "text-blue-700 border-blue-300 bg-blue-50")}
                  >
                    {statusFilter ? (STATUS_LABELS[statusFilter] ?? "Статус") : "Статус"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("")}>Все статусы</DropdownMenuItem>
                  {(Object.entries(STATUS_LABELS) as [PaymentStatus, string][]).map(([key, label]) => (
                    <DropdownMenuItem key={key} onClick={() => setStatusFilter(key as PaymentStatus)}>{label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ⚙️ — заглушка для будущих опциональных фильтров */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 flex-shrink-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-xs text-gray-400">Настройка фильтров</DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>

          {/* ── Accordion table ──────────────────────────────────────────────── */}
          <div className="pb-16">

            {/* Sticky global header — КЛИЕНТ | ID ПРОЕКТА | КАМ | СУММА, как в «Клиентах» */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
              <div
                className="px-8 py-2"
                style={{ display: "grid", gridTemplateColumns: GROUP_COL, alignItems: "center" }}
              >
                <div className="w-4" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Клиент</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ID проекта</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">КАМ</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Направление</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Сумма</span>
              </div>
            </div>

            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <Search className="w-10 h-10 text-gray-300" />
                <div>
                  <p className="text-gray-700 font-medium text-base">Ничего не найдено</p>
                  <p className="text-gray-400 text-sm mt-1">Попробуйте изменить фильтры</p>
                </div>
              </div>
            ) : (
              <div className="px-8 pt-2">
                {filteredGroups.map((group) => {
                  const isExpanded = expanded.has(group.id);
                  const groupSum = group.payments.reduce((s, p) => s + p.amount, 0);
                  // КАМ группы: если все платежи одного КАМа — показываем его; иначе первый
                  const primaryKam = group.payments[0].responsible;

                  return (
                    <div key={group.id} className="mb-1">
                      {/* ── Строка группы — grid как в «Клиентах» ── */}
                      <div
                        className="px-4 py-3 bg-gray-50/80 rounded-lg cursor-pointer hover:bg-gray-100/70 transition-colors group"
                        style={{ display: "grid", gridTemplateColumns: GROUP_COL, alignItems: "center" }}
                        onClick={() => toggleExpand(group.id)}
                      >
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
                            !isExpanded && "-rotate-90"
                          )}
                        />
                        {/* Клиент — как в «Клиентах»: жирный */}
                        <span className="font-semibold text-sm text-gray-900 truncate">{group.client}</span>
                        {/* ID проекта — 1-в-1 как в «Клиентах»: text-sm text-gray-700 font-medium */}
                        <span className="text-sm text-gray-700 font-medium">{group.projectCode}</span>
                        {/* КАМ — аватар + имя как в «Клиентах» */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0">
                            {primaryKam.initials}
                          </div>
                          <span className="text-sm text-gray-600 truncate">{primaryKam.name}</span>
                        </div>
                        {/* Направление */}
                        <span className="text-sm text-gray-600 truncate">{group.direction}</span>
                        {/* Сумма */}
                        <span className="font-semibold text-sm text-gray-900 tabular-nums">{fmt(groupSum)}</span>
                      </div>

                      {/* ── Раскрытые платежи ── */}
                      {isExpanded && group.payments.length > 0 && (
                        <div className="w-full mt-1">
                          {/* Sticky-шапка платёжных колонок — паттерн из «Клиентов» */}
                          <div className="sticky top-0 z-20 bg-white">
                            <div
                              className="grid text-[10px] uppercase text-gray-400 tracking-wider font-semibold"
                              style={{ gridTemplateColumns: PAYMENT_COL }}
                            >
                              <span />
                              <span className="px-3 py-2">Назначение</span>
                              <span className="px-3 py-2">Документ</span>
                              <span className="px-3 py-2 text-right">Сумма</span>
                              <span className="px-3 py-2">Ответственный</span>
                              <span className="px-3 py-2">План. дата</span>
                              <span className="px-3 py-2">Просрочка</span>
                              <span className="px-3 py-2">Причина</span>
                            </div>
                          </div>

                          {/* Строки платежей */}
                          <div className="space-y-0.5">
                            {group.payments.map((pay) => {
                              const status = computePaymentStatus(pay.planDate, pay.factDate);
                              const days = computeOverdueDays(pay.planDate, pay.factDate);
                              const isOverdue = status === "overdue";

                              return (
                                <div
                                  key={pay.id}
                                  className="grid items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/60 rounded"
                                  style={{ gridTemplateColumns: PAYMENT_COL }}
                                >
                                  <div />
                                  <span className="px-3 py-2.5 text-sm text-gray-700">{pay.description}</span>
                                  <a
                                    href="#"
                                    className="px-3 py-2.5 text-sm text-blue-600 hover:underline"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    {pay.docRef}
                                  </a>
                                  {/* Сумма — всегда чёрная */}
                                  <span className="px-3 py-2.5 text-sm font-medium text-right tabular-nums text-gray-900">
                                    {fmt(pay.amount)}
                                  </span>
                                  {/* Ответственный — аватар с инициалами как в «Клиентах» */}
                                  <div className="px-3 py-2.5 flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0">
                                      {pay.responsible.initials}
                                    </div>
                                    <span className="text-sm text-gray-600">{pay.responsible.name}</span>
                                  </div>
                                  <span className="px-3 py-2.5 text-sm text-gray-500">{pay.planDate}</span>
                                  {/* Просрочка — красный только для overdue; прочерк нейтральный */}
                                  <span
                                    className={cn(
                                      "px-3 py-2.5 text-sm tabular-nums font-medium",
                                      isOverdue ? "text-red-600" : "text-gray-400"
                                    )}
                                  >
                                    {isOverdue ? `+${days} дн` : "—"}
                                  </span>
                                  <span
                                    className={cn(
                                      "px-3 py-2.5 text-sm",
                                      !pay.delayReason && "text-gray-400 italic"
                                    )}
                                  >
                                    {pay.delayReason ?? "не указана"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ReceivablesPage;
