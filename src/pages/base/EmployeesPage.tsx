import { useState } from "react"
import { Search, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { EMPLOYEES_SEED } from "@/data/employees-seed"
import type { Employee, EmployeeStatus } from "@/types/employee"

const STATUS_META: Record<EmployeeStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Работает", color: "#10B981", bg: "bg-emerald-50 text-emerald-700" },
  fired: { label: "Уволен", color: "#EF4444", bg: "bg-red-50 text-red-700" },
}

function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

interface EmployeeFormState {
  fullName: string
  position: string
  phone: string
  email: string
  status: EmployeeStatus
}

function emptyForm(): EmployeeFormState {
  return { fullName: "", position: "", phone: "", email: "", status: "active" }
}

function formFromEmployee(employee: Employee): EmployeeFormState {
  return {
    fullName: employee.fullName,
    position: employee.position,
    phone: employee.phone ?? "",
    email: employee.email ?? "",
    status: employee.status,
  }
}

function StatusPill({ status, onChange }: { status: EmployeeStatus; onChange: (status: EmployeeStatus) => void }) {
  const meta = STATUS_META[status]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap transition-colors",
            meta.bg
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
          {meta.label}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {(Object.keys(STATUS_META) as EmployeeStatus[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={(e) => {
              e.stopPropagation()
              onChange(key)
            }}
            className={cn(key === status && "font-semibold")}
          >
            <span className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: STATUS_META[key].color }} />
            {STATUS_META[key].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES_SEED)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | EmployeeStatus>("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EmployeeFormState>(emptyForm())

  const filteredEmployees = employees.filter((e) => {
    if (statusFilter && e.status !== statusFilter) return false
    if (search && !e.fullName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function updateEmployeeStatus(id: string, status: EmployeeStatus) {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
  }

  function openCreateModal() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEditModal(employee: Employee) {
    setEditingId(employee.id)
    setForm(formFromEmployee(employee))
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function handleSave() {
    if (!form.fullName.trim()) return

    if (editingId) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? {
                ...e,
                fullName: form.fullName,
                initials: initialsOf(form.fullName),
                position: form.position,
                phone: form.phone || undefined,
                email: form.email || undefined,
                status: form.status,
              }
            : e
        )
      )
    } else {
      const newEmployee: Employee = {
        id: `es-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fullName: form.fullName,
        initials: initialsOf(form.fullName),
        position: form.position,
        phone: form.phone || undefined,
        email: form.email || undefined,
        status: form.status,
      }
      setEmployees((prev) => [newEmployee, ...prev])
    }

    closeModal()
  }

  function handleFire() {
    setForm((prev) => ({ ...prev, status: "fired" }))
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Добавить
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск по имени..."
            className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
              {statusFilter ? STATUS_META[statusFilter].label : "Все статусы"}
              <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("")}>Все статусы</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("active")}>Работает</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("fired")}>Уволен</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Имя Фамилия</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="cursor-pointer" onClick={() => openEditModal(employee)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center flex-shrink-0",
                        employee.avatarColor ?? "bg-slate-400"
                      )}
                    >
                      {employee.initials}
                    </div>
                    <span className="font-medium text-gray-900">{employee.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">{employee.position || "—"}</TableCell>
                <TableCell className="text-gray-700">{employee.phone || "—"}</TableCell>
                <TableCell className="text-gray-700">{employee.email || "—"}</TableCell>
                <TableCell>
                  <StatusPill status={employee.status} onChange={(status) => updateEmployeeStatus(employee.id, status)} />
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="text-center text-sm text-gray-400 py-8">
                  Ничего не найдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-[440px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
            <DialogTitle className="text-[15px] font-semibold text-gray-900">
              {editingId ? "Сотрудник" : "Новый сотрудник"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Имя Фамилия</label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Имя Фамилия"
                className="h-[34px] text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Должность</label>
              <Input
                value={form.position}
                onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                placeholder="Должность"
                className="h-[34px] text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Телефон</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+7 (9XX) XXX-XX-XX"
                className="h-[34px] text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Email</label>
              <Input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="imya.familia@doctrack.example"
                className="h-[34px] text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Статус</label>
              <Select value={form.status} onValueChange={(v) => setForm((prev) => ({ ...prev, status: v as EmployeeStatus }))}>
                <SelectTrigger className="h-[34px] text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Работает</SelectItem>
                  <SelectItem value="fired">Уволен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
            <div>
              {editingId && form.status !== "fired" && (
                <Button variant="destructive" size="sm" onClick={handleFire}>
                  Уволить
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={closeModal}>Отмена</Button>
              <Button size="sm" disabled={!form.fullName.trim()} onClick={handleSave}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeesPage
