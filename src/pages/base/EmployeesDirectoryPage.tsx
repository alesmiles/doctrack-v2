import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, Plus, ChevronDown, Briefcase, Mail, Send as TelegramIcon, Phone, CircleDot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { SidePanel } from "@/components/base/SidePanel";
import { StatusBadge } from "@/components/base/StatusBadge";
import { EMPLOYEE_STATUS_OPTIONS, ACCESS_SECTION_LABELS } from "@/components/base/constants";
import type { EmployeeRecord, AccessKey } from "@/components/base/types";
import { BASE_EMPLOYEES } from "@/mocks/baseEmployees";
import { BASE_CLIENTS } from "@/mocks/baseClients";
import { BASE_CONTRACTORS } from "@/mocks/baseContractors";

const ACCESS_ORDER: AccessKey[] = ["clients", "contractors", "employees", "payments", "base"];

function makeEmptyEmployee(): EmployeeRecord {
  return {
    id: `emp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fullName: "",
    position: "",
    email: "",
    telegram: "",
    phone: "",
    status: EMPLOYEE_STATUS_OPTIONS[0].label,
    access: { clients: false, contractors: false, employees: false, payments: false, base: false },
    linkedClientIds: [],
    linkedContractorIds: [],
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

function fieldInput(value: string, onChange: (v: string) => void) {
  return (
    <input
      className="w-full text-sm text-gray-800 outline-none border-b border-transparent focus:border-blue-300 bg-transparent"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function LinkedCompaniesBlock({
  title,
  linkedIds,
  allCompanies,
  onChange,
}: {
  title: string;
  linkedIds: string[];
  allCompanies: { id: string; company: string }[];
  onChange: (ids: string[]) => void;
}) {
  const linked = linkedIds
    .map((id) => allCompanies.find((c) => c.id === id))
    .filter((c): c is { id: string; company: string } => !!c);
  const available = allCompanies.filter((c) => !linkedIds.includes(c.id));

  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</div>
      <div className="flex flex-col gap-1.5 mb-2">
        {linked.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-800">{c.company}</span>
            <button
              type="button"
              className="text-gray-300 hover:text-red-500 transition-colors"
              onClick={() => onChange(linkedIds.filter((id) => id !== c.id))}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {linked.length === 0 && <div className="text-sm text-gray-400">Список пуст</div>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={available.length === 0}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> добавить ещё одного
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {available.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => onChange([...linkedIds, c.id])}>
              {c.company}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function EmployeesDirectoryPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>(BASE_EMPLOYEES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const selected = employees.find((e) => e.id === selectedId) ?? null;

  const updateEmployee = (id: string, patch: Partial<EmployeeRecord>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const openEmployee = (id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
  };

  const handleAdd = () => {
    const employee = makeEmptyEmployee();
    setEmployees((prev) => [employee, ...prev]);
    openEmployee(employee.id);
  };

  const filteredEmployees = employees.filter((e) => {
    if (statusFilter && e.status !== statusFilter) return false;
    if (search && !e.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Добавить
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск по ФИО..."
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
            {EMPLOYEE_STATUS_OPTIONS.map((option) => (
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
              <TableHead>ФИО</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="cursor-pointer" onClick={() => openEmployee(employee.id)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {getInitials(employee.fullName)}
                    </div>
                    <span className="font-medium text-gray-900">{employee.fullName || "Без имени"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">{employee.position || "—"}</TableCell>
                <TableCell>
                  <StatusBadge
                    value={employee.status}
                    options={EMPLOYEE_STATUS_OPTIONS}
                    onChange={(v) => updateEmployee(employee.id, { status: v })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SidePanel
        title={selected?.fullName?.trim() ? selected.fullName : "Новый сотрудник"}
        open={panelOpen && !!selected}
        onClose={() => setPanelOpen(false)}
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-xs text-gray-400 mb-1">ФИО</div>
              <input
                className="w-full text-base font-semibold text-gray-900 outline-none border-b border-transparent focus:border-blue-300 bg-transparent"
                value={selected.fullName}
                placeholder="Новый сотрудник"
                onChange={(e) => updateEmployee(selected.id, { fullName: e.target.value })}
              />
            </div>

            <div>
              <FieldRow icon={Briefcase} label="Должность">
                {fieldInput(selected.position, (v) => updateEmployee(selected.id, { position: v }))}
              </FieldRow>
              <FieldRow icon={Mail} label="Email">
                {fieldInput(selected.email, (v) => updateEmployee(selected.id, { email: v }))}
              </FieldRow>
              <FieldRow icon={TelegramIcon} label="Telegram">
                {fieldInput(selected.telegram, (v) => updateEmployee(selected.id, { telegram: v }))}
              </FieldRow>
              <FieldRow icon={Phone} label="Телефон">
                {fieldInput(selected.phone, (v) => updateEmployee(selected.id, { phone: v }))}
              </FieldRow>
              <FieldRow icon={CircleDot} label="Статус">
                <StatusBadge
                  value={selected.status}
                  options={EMPLOYEE_STATUS_OPTIONS}
                  onChange={(v) => updateEmployee(selected.id, { status: v })}
                />
              </FieldRow>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Доступ к разделам</div>
              <div className="flex flex-col gap-2">
                {ACCESS_ORDER.map((key) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={selected.access[key]}
                      onCheckedChange={(checked) =>
                        updateEmployee(selected.id, { access: { ...selected.access, [key]: checked === true } })
                      }
                    />
                    <span className="text-sm text-gray-800">{ACCESS_SECTION_LABELS[key]}</span>
                  </label>
                ))}
              </div>
            </div>

            {selected.access.clients && (
              <LinkedCompaniesBlock
                title="Закреплённые клиенты"
                linkedIds={selected.linkedClientIds}
                allCompanies={BASE_CLIENTS}
                onChange={(ids) => updateEmployee(selected.id, { linkedClientIds: ids })}
              />
            )}

            {selected.access.contractors && (
              <LinkedCompaniesBlock
                title="Закреплённые подрядчики"
                linkedIds={selected.linkedContractorIds}
                allCompanies={BASE_CONTRACTORS}
                onChange={(ids) => updateEmployee(selected.id, { linkedContractorIds: ids })}
              />
            )}
          </div>
        )}
      </SidePanel>
    </div>
  );
}

export default EmployeesDirectoryPage;
