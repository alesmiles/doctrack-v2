import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, Plus, ChevronDown, Building, CircleDot, FileStack, MapPin, Landmark, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SidePanel } from "./SidePanel";
import { StatusBadge } from "./StatusBadge";
import { ResponsiblePersonsList } from "./ResponsiblePersonsList";
import { ResponsibleColumnCell } from "./ResponsibleColumnCell";
import { ExpandableLegalEntity } from "./ExpandableLegalEntity";
import { COMPANY_STATUS_OPTIONS } from "./constants";
import type { CompanyRecord, Person } from "./types";

interface CompanyDirectoryViewProps {
  pageTitle: string;
  initialRecords: CompanyRecord[];
  thirdFieldKey: "edoSystem" | "serviceDirection";
  thirdFieldLabel: string;
  newRecordLabel: string;
}

function makeEmptyRecord(): CompanyRecord {
  return {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    company: "",
    legalEntities: [],
    status: COMPANY_STATUS_OPTIONS[0].label,
    edoSystem: "",
    serviceDirection: "",
    legalAddress: "",
    inn: "",
    kpp: "",
    ogrn: "",
    bankAccount: "",
    bik: "",
    bankName: "",
    responsiblePeople: [],
  };
}

function FieldRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className="text-sm text-gray-800">{children}</div>
      </div>
    </div>
  );
}

function fieldInput(value: string, onChange: (v: string) => void, placeholder?: string) {
  return (
    <input
      className="w-full text-sm text-gray-800 outline-none border-b border-transparent focus:border-blue-300 bg-transparent"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function CompanyDirectoryView({ pageTitle, initialRecords, thirdFieldKey, thirdFieldLabel, newRecordLabel }: CompanyDirectoryViewProps) {
  const [records, setRecords] = useState<CompanyRecord[]>(initialRecords);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activityDrafts, setActivityDrafts] = useState<Record<string, string>>({});
  const [activityLog, setActivityLog] = useState<Record<string, string[]>>({});

  const selected = records.find((r) => r.id === selectedId) ?? null;

  const updateRecord = (id: string, patch: Partial<CompanyRecord>) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const openRecord = (id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  const handleAdd = () => {
    const record = makeEmptyRecord();
    setRecords((prev) => [record, ...prev]);
    openRecord(record.id);
  };

  const filteredRecords = records.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search && !r.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sendActivity = (id: string) => {
    const text = (activityDrafts[id] ?? "").trim();
    if (!text) return;
    setActivityLog((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), text] }));
    setActivityDrafts((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Добавить
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск по компании..."
            className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9 text-sm bg-gray-50 border-gray-200", statusFilter && "text-blue-700 border-blue-300 bg-blue-50")}
            >
              {statusFilter || "Все статусы"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setStatusFilter("")}>Все статусы</DropdownMenuItem>
            {COMPANY_STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.label} onClick={() => setStatusFilter(option.label)}>
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Компания</TableHead>
              <TableHead>Юр.лицо</TableHead>
              <TableHead>Ответственные лица</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow
                key={record.id}
                className="cursor-pointer"
                onClick={() => openRecord(record.id)}
              >
                <TableCell className="font-medium text-gray-900">{record.company || "Без названия"}</TableCell>
                <TableCell>
                  <ExpandableLegalEntity entities={record.legalEntities} interactive={false} />
                </TableCell>
                <TableCell>
                  <ResponsibleColumnCell people={record.responsiblePeople} />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    value={record.status}
                    options={COMPANY_STATUS_OPTIONS}
                    onChange={(v) => updateRecord(record.id, { status: v })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SidePanel
        title={selected?.company?.trim() ? selected.company : newRecordLabel}
        open={panelOpen && !!selected}
        onClose={closePanel}
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-xs text-gray-400 mb-1">Название компании</div>
              <input
                className="w-full text-base font-semibold text-gray-900 outline-none border-b border-transparent focus:border-blue-300 bg-transparent"
                value={selected.company}
                placeholder={newRecordLabel}
                onChange={(e) => updateRecord(selected.id, { company: e.target.value })}
              />
            </div>

            <div>
              <FieldRow icon={Building} label="Юр.лицо(-а)">
                <ExpandableLegalEntity entities={selected.legalEntities} />
              </FieldRow>
              <FieldRow icon={CircleDot} label="Статус">
                <StatusBadge
                  value={selected.status}
                  options={COMPANY_STATUS_OPTIONS}
                  onChange={(v) => updateRecord(selected.id, { status: v })}
                />
              </FieldRow>
              <FieldRow icon={FileStack} label={thirdFieldLabel}>
                {fieldInput(selected[thirdFieldKey], (v) => updateRecord(selected.id, { [thirdFieldKey]: v } as Partial<CompanyRecord>))}
              </FieldRow>
              <FieldRow icon={MapPin} label="Юр.адрес">
                {fieldInput(selected.legalAddress, (v) => updateRecord(selected.id, { legalAddress: v }))}
              </FieldRow>
              <FieldRow icon={Landmark} label="ИНН / КПП / ОГРН">
                <div className="flex items-center gap-2">
                  {fieldInput(selected.inn, (v) => updateRecord(selected.id, { inn: v }), "ИНН")}
                  {fieldInput(selected.kpp, (v) => updateRecord(selected.id, { kpp: v }), "КПП")}
                  {fieldInput(selected.ogrn, (v) => updateRecord(selected.id, { ogrn: v }), "ОГРН")}
                </div>
              </FieldRow>
              <FieldRow icon={Landmark} label="Р/с">
                {fieldInput(selected.bankAccount, (v) => updateRecord(selected.id, { bankAccount: v }))}
              </FieldRow>
              <FieldRow icon={Landmark} label="БИК">
                {fieldInput(selected.bik, (v) => updateRecord(selected.id, { bik: v }))}
              </FieldRow>
              <FieldRow icon={Landmark} label="Банк">
                {fieldInput(selected.bankName, (v) => updateRecord(selected.id, { bankName: v }))}
              </FieldRow>
            </div>

            <ResponsiblePersonsList
              people={selected.responsiblePeople}
              onChange={(people: Person[]) => updateRecord(selected.id, { responsiblePeople: people })}
            />

            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Активность</div>
              {(activityLog[selected.id]?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-1.5 mb-2">
                  {activityLog[selected.id].map((entry, i) => (
                    <div key={i} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      {entry}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300"
                  placeholder="Написать комментарий..."
                  value={activityDrafts[selected.id] ?? ""}
                  onChange={(e) => setActivityDrafts((prev) => ({ ...prev, [selected.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendActivity(selected.id);
                  }}
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => sendActivity(selected.id)}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Отправить
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
