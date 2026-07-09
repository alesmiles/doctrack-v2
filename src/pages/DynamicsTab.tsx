import { useState } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  MonthKey, kpiByMonth, barDataByMonth,
  companyTrend, clientTrend, kamTrend,
} from "@/mocks/receivables-dynamics";

// ── Formatters ─────────────────────────────────────────────────────────────────

function fmtK(n: number): string {
  return Math.round(n / 1000).toLocaleString("en-US") + "k";
}

function fmtAxisM(n: number): string {
  if (n === 0) return "0";
  return (n / 1_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + " M";
}

function fmtMln(n: number): string {
  return (n / 1_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + " mln ₽";
}

// ── Segment toggle ─────────────────────────────────────────────────────────────

function SegmentToggle<T extends string>({
  options, value, onChange,
}: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex border border-gray-200 rounded-md overflow-hidden text-[11px] flex-shrink-0">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "px-2.5 py-1 transition-colors",
            value === o.id ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Card shell ─────────────────────────────────────────────────────────────────

function CardShell({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-700">{title}</p>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── KPI card — compact dot layout ─────────────────────────────────────────────

function KpiCard({ dotColor, label, value, sub }: {
  dotColor: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
        <span className="text-[12px] text-gray-500">{label}</span>
      </div>
      <p className="text-[22px] font-semibold text-gray-900 leading-tight mt-1">{value}</p>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}

// ── Legend row ─────────────────────────────────────────────────────────────────

function LegendRow({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          {item.dashed ? (
            <svg width="18" height="6" className="flex-shrink-0">
              <line x1="0" y1="3" x2="18" y2="3" stroke={item.color} strokeWidth="2" strokeDasharray="5 4" />
            </svg>
          ) : (
            <div className="w-3 h-3 rounded-[2px] flex-shrink-0" style={{ backgroundColor: item.color }} />
          )}
          <span className="text-[11px] text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Show-more toggle button ────────────────────────────────────────────────────

function ShowMoreBtn({ showAll, count, onToggle }: {
  showAll: boolean; count: number; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="text-[11px] text-blue-500 hover:text-blue-600 text-left mt-0.5"
    >
      {showAll ? "− Collapse" : `+ Show more (${count})`}
    </button>
  );
}

// ── Overlay bar — shared primitive (light = total track, dark = overdue fill) ──

function OverlayTrack({
  totalPct, overduePct, height = 10,
}: { totalPct: number; overduePct: number; height?: number }) {
  return (
    <div className="flex-1 bg-gray-100 rounded overflow-hidden" style={{ height }}>
      <div
        style={{
          position: "relative",
          width: `${totalPct}%`,
          height: "100%",
          backgroundColor: "#BFDBFE",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${overduePct}%`,
            backgroundColor: "#60A5FA",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

// ── Client bar: label | [track] | amount ───────────────────────────────────────

function ClientHBar({ label, total, overdue, max, onClick }: {
  label: string; total: number; overdue: number; max: number; onClick?: () => void;
}) {
  const totalPct = max > 0 ? (total / max) * 100 : 0;
  const overduePct = total > 0 ? (overdue / total) * 100 : 0;
  return (
    <div
      className={cn("flex items-center gap-2 py-[3px]", onClick && "cursor-pointer group")}
      onClick={onClick}
    >
      <span className="w-[88px] text-[11px] text-gray-600 text-right truncate flex-shrink-0">{label}</span>
      <div className="flex-1 group-hover:opacity-80 transition-opacity">
        <OverlayTrack totalPct={totalPct} overduePct={overduePct} />
      </div>
      <span className="w-[46px] text-[11px] text-gray-500 text-right flex-shrink-0 tabular-nums">
        {fmtK(total)}
      </span>
    </div>
  );
}

// ── KAM bar: name + numbers | [track] ─────────────────────────────────────────

function KamHBar({ label, total, overdue, max, rightLabel, onClick }: {
  label: string; total: number; overdue: number; max: number; rightLabel: string; onClick?: () => void;
}) {
  const totalPct = max > 0 ? (total / max) * 100 : 0;
  const overduePct = total > 0 ? (overdue / total) * 100 : 0;
  return (
    <div
      className={cn("flex flex-col gap-1", onClick && "cursor-pointer group")}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-700">{label}</span>
        <span className="text-[11px] text-gray-500 tabular-nums">{rightLabel}</span>
      </div>
      <div className="group-hover:opacity-80 transition-opacity">
        <OverlayTrack totalPct={totalPct} overduePct={overduePct} />
      </div>
    </div>
  );
}

// ── Simple bar: label | [single-color fill] | right ───────────────────────────

function SimpleHBar({ label, value, max, color, right, onClick }: {
  label: string; value: number; max: number; color: string; right: string; onClick?: () => void;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div
      className={cn("flex items-center gap-2 py-[3px]", onClick && "cursor-pointer group")}
      onClick={onClick}
    >
      <span className="w-[88px] text-[11px] text-gray-600 text-right truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-[10px] bg-gray-100 rounded overflow-hidden group-hover:opacity-80 transition-opacity">
        <div style={{ width: `${pct}%`, backgroundColor: color, borderRadius: 4, height: "100%" }} />
      </div>
      <span className="w-[46px] text-[11px] text-gray-500 text-right flex-shrink-0">{right}</span>
    </div>
  );
}

const BAR_LEGEND = [
  { color: "#BFDBFE", label: "Billed" },
  { color: "#60A5FA", label: "Of which overdue" },
];

// ── Analytics cards (data injected by parent) ─────────────────────────────────

type ClientRow = { client: string; total: number; overdue: number };
type KamRow    = { kam:    string; total: number; overdue: number };
type AgingRow  = { bucket: string; amount: number; clients: number };
type ReasonRow = { reason: string; clients: number };

function ClientDebtCard({ data, showAll, onToggle }: {
  data: ClientRow[]; showAll: boolean; onToggle: () => void;
}) {
  const [sort, setSort] = useState<"sum" | "overdue">("sum");
  const sorted = [...data].sort((a, b) =>
    sort === "sum" ? b.total - a.total : b.overdue - a.overdue
  );
  const visible = showAll ? sorted : sorted.slice(0, 6);
  const max = sorted[0]?.total ?? 1;

  return (
    <CardShell
      title="Debt by Client"
      subtitle="billed to clients / of which overdue"
      action={
        <SegmentToggle
          options={[{ id: "sum" as const, label: "by debt" }, { id: "overdue" as const, label: "by overdue" }]}
          value={sort}
          onChange={setSort}
        />
      }
    >
      <div className="space-y-0.5">
        {visible.map(c => (
          <ClientHBar key={c.client} label={c.client} total={c.total} overdue={c.overdue} max={max} />
        ))}
      </div>
      {data.length > 6 && (
        <ShowMoreBtn showAll={showAll} count={data.length - 6} onToggle={onToggle} />
      )}
      <LegendRow items={BAR_LEGEND} />
    </CardShell>
  );
}

function KamDebtCard({ data, showAll, onToggle }: {
  data: KamRow[]; showAll: boolean; onToggle: () => void;
}) {
  const [sort, setSort] = useState<"sum" | "overdue">("sum");
  const sorted = [...data].sort((a, b) =>
    sort === "sum" ? b.total - a.total : b.overdue - a.overdue
  );
  const visible = showAll ? sorted : sorted.slice(0, 3);
  const max = sorted[0]?.total ?? 1;

  return (
    <CardShell
      title="Debt by KAM"
      subtitle="billed / of which overdue"
      action={
        <SegmentToggle
          options={[{ id: "sum" as const, label: "by debt" }, { id: "overdue" as const, label: "by overdue" }]}
          value={sort}
          onChange={setSort}
        />
      }
    >
      <div className="space-y-4">
        {visible.map(k => (
          <KamHBar
            key={k.kam}
            label={k.kam}
            total={k.total}
            overdue={k.overdue}
            max={max}
            rightLabel={`${fmtK(k.total)} / ${fmtK(k.overdue)}`}
          />
        ))}
      </div>
      {data.length > 3 && (
        <ShowMoreBtn showAll={showAll} count={data.length - 3} onToggle={onToggle} />
      )}
      <LegendRow items={BAR_LEGEND} />
    </CardShell>
  );
}

function AgingCard({ data, kpi }: {
  data: AgingRow[];
  kpi: { overdue: number; overdueCount: number };
}) {
  const [mode, setMode] = useState<"amount" | "clients">("amount");
  const COLORS = ["#BFDBFE", "#60A5FA", "#3B82F6", "#1D4ED8"];
  const max = mode === "amount"
    ? Math.max(...data.map(a => a.amount))
    : Math.max(...data.map(a => a.clients));

  return (
    <CardShell
      title="Overdue by Age"
      subtitle={`total overdue ${fmtMln(kpi.overdue)} · ${kpi.overdueCount} cl.`}
      action={
        <SegmentToggle
          options={[{ id: "amount" as const, label: "₽" }, { id: "clients" as const, label: "clients" }]}
          value={mode}
          onChange={setMode}
        />
      }
    >
      <div className="space-y-0.5">
        {data.map((a, i) => (
          <SimpleHBar
            key={a.bucket}
            label={a.bucket}
            value={mode === "amount" ? a.amount : a.clients}
            max={max}
            color={COLORS[i]}
            right={mode === "amount" ? fmtK(a.amount) : a.clients + " cl."}
          />
        ))}
      </div>
      <p className="text-[10px] text-gray-400">darker = older debt</p>
    </CardShell>
  );
}

function ReasonsCard({ data }: { data: ReasonRow[] }) {
  const max = Math.max(...data.map(r => r.clients));
  return (
    <CardShell title="Delay Reasons" subtitle="clients with delays">
      <div className="space-y-0.5">
        {data.map(r => (
          <SimpleHBar
            key={r.reason}
            label={r.reason}
            value={r.clients}
            max={max}
            color="#60A5FA"
            right={r.clients + " cl."}
          />
        ))}
      </div>
    </CardShell>
  );
}

// ── Trend area chart ───────────────────────────────────────────────────────────

interface TrendChartProps {
  data: { month: string; debt: number; days: number }[];
  gradId: string;
  areaStroke: string;
  areaFill: string;
  dotColor: string;
  daysStroke: string;
  debtLabel: string;
  daysLabel: string;
}

function TrendAreaChart({
  data, gradId, areaStroke, areaFill, dotColor, daysStroke, debtLabel, daysLabel,
}: TrendChartProps) {
  const maxDebt = Math.max(...data.map(d => d.debt));
  const step = Math.pow(10, Math.floor(Math.log10(maxDebt || 1)));
  const top = Math.ceil(maxDebt / step) * step;
  const debtTicks = [0, Math.round(top / 2), top];

  return (
    <>
      <LegendRow items={[
        { color: areaStroke, label: debtLabel },
        { color: daysStroke, label: daysLabel, dashed: true },
      ]} />
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={{ top: 8, right: 40, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={areaFill} stopOpacity={0.4} />
              <stop offset="95%" stopColor={areaFill} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={fmtAxisM}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={44}
            ticks={debtTicks}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => v + "d"}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={28}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs min-w-[130px]">
                  <p className="font-semibold text-gray-700 mb-1">{label}</p>
                  {payload.map((p: any, i: number) => (
                    <p key={i} className="flex justify-between gap-4">
                      <span style={{ color: p.stroke ?? p.fill }}>{p.name}</span>
                      <span className="font-medium text-gray-900 tabular-nums">
                        {p.name === debtLabel ? fmtMln(p.value) : p.value + " days"}
                      </span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="debt"
            name={debtLabel}
            stroke={areaStroke}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={{ r: 3, fill: dotColor, stroke: "white", strokeWidth: 2 }}
            activeDot={{ r: 4.5, fill: dotColor, stroke: "white", strokeWidth: 2 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="days"
            name={daysLabel}
            stroke={daysStroke}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 3, fill: daysStroke, stroke: "white", strokeWidth: 1.5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}

// ── Month selector constants ───────────────────────────────────────────────────

const FUTURE_MONTHS: Exclude<MonthKey, 'All periods'>[] = ['June 2026', 'July 2026', 'August 2026'];
const TREND_SUBTITLE = "Nov 2025 → Jun 2026 · 8-month history";

// ── Main export ────────────────────────────────────────────────────────────────

export function DynamicsTab() {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>('June 2026');
  const [selectedClient, setSelectedClient] = useState("Yandex");
  const [selectedKam, setSelectedKam] = useState("Кирилл П.");
  const [clientShowAll, setClientShowAll] = useState(false);
  const [kamShowAll, setKamShowAll] = useState(false);

  const kpi = kpiByMonth[selectedMonth];
  const barData = barDataByMonth[selectedMonth];

  const clientKeys = Object.keys(clientTrend);
  const kamKeys = Object.keys(kamTrend);

  return (
    <div className="px-8 py-4 space-y-6 pb-16">

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">Period:</span>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[11px]">
          {FUTURE_MONTHS.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={cn(
                "px-3 py-1.5 transition-colors",
                selectedMonth === m ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSelectedMonth('All periods')}
          className={cn(
            "px-3 py-1.5 text-[11px] border border-gray-200 rounded-lg transition-colors",
            selectedMonth === 'All periods' ? "bg-gray-900 text-white border-transparent" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          All periods
        </button>
      </div>

      <section>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          AR Summary
        </p>
        <div className="grid grid-cols-4 gap-3">
          <KpiCard
            dotColor="#3B82F6"
            label="Total AR"
            value={fmtMln(kpi.total)}
            sub="as of 13.06.2026"
          />
          <KpiCard
            dotColor="#EF4444"
            label="Overdue"
            value={fmtMln(kpi.overdue)}
            sub={`${kpi.overdueCount} payments out of ${kpi.totalCount}`}
          />
          <KpiCard
            dotColor="#818CF8"
            label="Overdue Period"
            value={`${kpi.medianDays} days`}
            sub={`median / max ${kpi.maxDays} days`}
          />
          <KpiCard
            dotColor="#22C55E"
            label="Collected"
            value={`${kpi.collectedPct}%`}
            sub={`${fmtMln(kpi.collected)} out of ${fmtMln(kpi.total)}`}
          />
        </div>
      </section>

      <section>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Analytics
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className={cn(clientShowAll && "col-span-2")}>
            <ClientDebtCard
              data={barData.debtByClient}
              showAll={clientShowAll}
              onToggle={() => setClientShowAll(v => !v)}
            />
          </div>
          <KamDebtCard
            data={barData.debtByKam}
            showAll={kamShowAll}
            onToggle={() => setKamShowAll(v => !v)}
          />
          <AgingCard data={barData.aging} kpi={kpi} />
          <ReasonsCard data={barData.delayReasons} />
        </div>
      </section>

      <section>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Trends
        </p>
        <div className="flex flex-col gap-4">

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-700">Company Trend</p>
            <p className="text-[11px] text-gray-400 mt-0.5 mb-3">{TREND_SUBTITLE}</p>
            <TrendAreaChart
              data={companyTrend.map(d => ({ month: d.month, debt: d.overdue, days: d.medianDays }))}
              gradId="gradCompany"
              areaStroke="#EF4444"
              areaFill="#FCA5A5"
              dotColor="#EF4444"
              daysStroke="#818CF8"
              debtLabel="Overdue balance"
              daysLabel="Median days"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-700">Client Dynamics</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{TREND_SUBTITLE}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs bg-gray-50 border-gray-200 flex-shrink-0">
                    {selectedClient} <ChevronDown className="w-3 h-3 ml-1.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {clientKeys.map(c => (
                    <DropdownMenuItem key={c} onClick={() => setSelectedClient(c)}>{c}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <TrendAreaChart
              data={clientTrend[selectedClient]}
              gradId="gradClient"
              areaStroke="#60A5FA"
              areaFill="#BFDBFE"
              dotColor="#3B82F6"
              daysStroke="#818CF8"
              debtLabel="Debt"
              daysLabel="Days overdue"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-700">KAM Dynamics</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{TREND_SUBTITLE}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs bg-gray-50 border-gray-200 flex-shrink-0">
                    {selectedKam} <ChevronDown className="w-3 h-3 ml-1.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {kamKeys.map(k => (
                    <DropdownMenuItem key={k} onClick={() => setSelectedKam(k)}>{k}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <TrendAreaChart
              data={kamTrend[selectedKam]}
              gradId="gradKam"
              areaStroke="#A78BFA"
              areaFill="#C4B5FD"
              dotColor="#8B5CF6"
              daysStroke="#60A5FA"
              debtLabel="Portfolio debt"
              daysLabel="Days overdue"
            />
          </div>

        </div>
      </section>
    </div>
  );
}

export default DynamicsTab;
