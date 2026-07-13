import type { StatusOption } from "./types";

export const COMPANY_STATUS_OPTIONS: StatusOption[] = [
  { label: "Лид", color: "#9CA3AF" },
  { label: "Пилот", color: "#38BDF8" },
  { label: "Активный", color: "#10B981" },
  { label: "Отток", color: "#EF4444" },
];

export const EMPLOYEE_STATUS_OPTIONS: StatusOption[] = [
  { label: "Активен", color: "#10B981" },
  { label: "Уволен", color: "#9CA3AF" },
];

export const ACCESS_SECTION_LABELS: Record<string, string> = {
  clients: "Клиенты",
  contractors: "Подрядчики",
  employees: "Сотрудники",
  payments: "Платежи",
  base: "База",
};
