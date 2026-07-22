import { RAW_PROJECTS } from "@/mocks/projects";
import { BASE_CONTRACTORS } from "@/mocks/baseContractors";
import { BASE_EMPLOYEES } from "@/mocks/baseEmployees";

// Источник: Блок 0 doctrack-soglasovanie-tz.md недоступен в репозитории на
// момент выполнения задачи (см. IMPLEMENTATION_REPORT.md) — минимальный сид
// с полями, достаточными для расчёта счётчика "На подписи · N" (Sidebar.tsx).
export interface SoglasovanieItem {
  id: string;
  stage: string;
  assignee: string;
}

export const SOGLASOVANIE_SEED: SoglasovanieItem[] = [
  { id: "sog-1", stage: "smety_review", assignee: "user-kam" },
  { id: "sog-2", stage: "documents_review", assignee: "user-kam" },
  { id: "sog-3", stage: "documents_review", assignee: "user-lawyer" },
  { id: "sog-4", stage: "smety_review", assignee: "user-producer" },
  { id: "sog-5", stage: "documents_review", assignee: "user-producer" },
  { id: "sog-6", stage: "sign_us", assignee: "user-director" },
  { id: "sog-7", stage: "sign_us", assignee: "user-director" },
  { id: "sog-8", stage: "sign_us", assignee: "user-director" },
  { id: "sog-9", stage: "smety_review", assignee: "user-director" },
  { id: "sog-10", stage: "sign_us", assignee: "user-kam" },
];

// ─── Согласование → Документы (SoglasovanieDocumentsPage) ──────────────────────
// DocType/DocDirection/DocStage и DOCUMENTS не существовали в репозитории на
// момент постановки задачи — заведены здесь по образцу mocks/kanbanMockData.ts
// (типы рядом с мок-данными, а не в src/types), см. допущения в
// IMPLEMENTATION_REPORT.md.

export type DocDirection = "clients" | "contractors_client" | "contractors_internal";

export type DocStage = "internal_review" | "with_counterparty" | "sign_us" | "sign_them" | "signed";

export type DocType = "Договор" | "ДС" | "Приложение" | "Счёт" | "УПД" | "Акт" | "СФ";

export const DOC_STAGE_ORDER: DocStage[] = [
  "internal_review",
  "with_counterparty",
  "sign_us",
  "sign_them",
  "signed",
];

export const DOC_DIRECTION_LABELS: Record<DocDirection, string> = {
  clients: "Клиенты",
  contractors_client: "Подрядчики · клиенты",
  contractors_internal: "Подрядчики · внутр.",
};

export const DOC_STAGE_LABELS: Record<DocDirection, Record<DocStage, string>> = {
  clients: {
    internal_review: "Внутр. согласование",
    with_counterparty: "С клиентом",
    sign_us: "Подпись · мы",
    sign_them: "Подпись · клиент",
    signed: "Подписан",
  },
  contractors_client: {
    internal_review: "Внутр. согласование",
    with_counterparty: "С подрядчиком",
    sign_us: "Подпись · мы",
    sign_them: "Подпись · подрядчик",
    signed: "Подписан",
  },
  contractors_internal: {
    internal_review: "Внутр. согласование",
    with_counterparty: "С подрядчиком",
    sign_us: "Подпись · мы",
    sign_them: "Подпись · подрядчик",
    signed: "Подписан",
  },
};

// D14: период, через который подписанная карточка "снимется" с доски —
// в моке не задан отдельным полем, зафиксирован как дефолт 3 дня.
export const DEFAULT_AUTO_HIDE_DAYS = 3;

export interface SoglasovanieDocument {
  id: string;
  name: string;
  type: DocType;
  direction: DocDirection;
  stage: DocStage;
  projectId?: number; // RAW_PROJECTS.id — clients и contractors_client
  contractorId?: string; // BASE_CONTRACTORS.id — contractors_client и contractors_internal
  responsibleId?: string; // BASE_EMPLOYEES.id — "Ответственный" для contractors_internal
  version: number;
  amount: number | null;
  deadline: string | null;
  assignedTo: string; // DEMO_USERS.id
  createdAt: string;
  daysInStage: number;
  overdueByDays: number; // 0 — не просрочен
  channel?: "edo";
  autoHideInDays?: number; // override DEFAULT_AUTO_HIDE_DAYS для этой карточки
}

export const DOCUMENTS: SoglasovanieDocument[] = [
  // ─── Клиенты ──────────────────────────────────────────────────────────────
  {
    id: "doc-c1", name: "Договор №112", type: "Договор", direction: "clients", stage: "internal_review",
    projectId: 1, version: 3, amount: 4500000, deadline: "2026-06-20", assignedTo: "user-lawyer",
    createdAt: "2026-06-10", daysInStage: 2, overdueByDays: 0,
  },
  {
    id: "doc-c2", name: "Договор №98", type: "Договор", direction: "clients", stage: "internal_review",
    projectId: 2, version: 1, amount: 2800000, deadline: "2026-06-05", assignedTo: "user-lawyer",
    createdAt: "2026-06-01", daysInStage: 5, overdueByDays: 5,
  },
  {
    id: "doc-c3", name: "Приложение 7", type: "Приложение", direction: "clients", stage: "with_counterparty",
    projectId: 7, version: 1, amount: null, deadline: "2026-06-18", assignedTo: "user-producer",
    createdAt: "2026-06-11", daysInStage: 1, overdueByDays: 0,
  },
  {
    id: "doc-c4", name: "УПД 44", type: "УПД", direction: "clients", stage: "with_counterparty",
    projectId: 7, version: 1, amount: 3600000, deadline: "2026-06-15", assignedTo: "user-producer",
    createdAt: "2026-06-12", daysInStage: 0, overdueByDays: 0, channel: "edo",
  },
  {
    id: "doc-c5", name: "Акт №21", type: "Акт", direction: "clients", stage: "sign_us",
    projectId: 4, version: 2, amount: 8900000, deadline: "2026-06-14", assignedTo: "user-director",
    createdAt: "2026-06-09", daysInStage: 1, overdueByDays: 0,
  },
  {
    id: "doc-c6", name: "ДС к пр. 4", type: "ДС", direction: "clients", stage: "sign_them",
    projectId: 1, version: 2, amount: 4500000, deadline: "2026-06-06", assignedTo: "user-kam",
    createdAt: "2026-05-30", daysInStage: 6, overdueByDays: 6, channel: "edo",
  },
  {
    id: "doc-c7", name: "Договор №77", type: "Договор", direction: "clients", stage: "signed",
    projectId: 2, version: 4, amount: 2800000, deadline: null, assignedTo: "user-kam",
    createdAt: "2026-06-08", daysInStage: 0, overdueByDays: 0,
  },
  {
    id: "doc-c8", name: "Счёт №15", type: "Счёт", direction: "clients", stage: "signed",
    projectId: 1, version: 1, amount: 4500000, deadline: null, assignedTo: "user-producer",
    createdAt: "2026-06-07", daysInStage: 0, overdueByDays: 0,
  },

  // ─── Подрядчики · клиенты ───────────────────────────────────────────────────
  {
    id: "doc-cc1", name: "Договор подряда №5", type: "Договор", direction: "contractors_client", stage: "internal_review",
    contractorId: "co-1", projectId: 1, version: 1, amount: 950000, deadline: "2026-06-19", assignedTo: "user-producer",
    createdAt: "2026-06-11", daysInStage: 3, overdueByDays: 0,
  },
  {
    id: "doc-cc2", name: "Приложение №2", type: "Приложение", direction: "contractors_client", stage: "internal_review",
    contractorId: "co-1", projectId: 2, version: 1, amount: null, deadline: "2026-06-16", assignedTo: "user-lawyer",
    createdAt: "2026-06-12", daysInStage: 0, overdueByDays: 0,
  },
  {
    id: "doc-cc3", name: "Акт №9", type: "Акт", direction: "contractors_client", stage: "with_counterparty",
    contractorId: "co-1", projectId: 1, version: 2, amount: 950000, deadline: "2026-06-13", assignedTo: "user-kam",
    createdAt: "2026-06-10", daysInStage: 1, overdueByDays: 0,
  },
  {
    id: "doc-cc4", name: "УПД №14", type: "УПД", direction: "contractors_client", stage: "sign_us",
    contractorId: "co-2", projectId: 7, version: 1, amount: 620000, deadline: "2026-06-08", assignedTo: "user-director",
    createdAt: "2026-06-02", daysInStage: 4, overdueByDays: 4,
  },
  {
    id: "doc-cc5", name: "Договор №21", type: "Договор", direction: "contractors_client", stage: "sign_them",
    contractorId: "co-4", projectId: 4, version: 3, amount: 1400000, deadline: "2026-06-11", assignedTo: "user-kam",
    createdAt: "2026-06-05", daysInStage: 1, overdueByDays: 0, channel: "edo",
  },
  {
    id: "doc-cc6", name: "Счёт №31", type: "Счёт", direction: "contractors_client", stage: "signed",
    contractorId: "co-2", projectId: 7, version: 1, amount: 620000, deadline: null, assignedTo: "user-producer",
    createdAt: "2026-06-06", daysInStage: 0, overdueByDays: 0,
  },

  // ─── Подрядчики · внутр. ────────────────────────────────────────────────────
  {
    id: "doc-ci1", name: "Договор №40", type: "Договор", direction: "contractors_internal", stage: "internal_review",
    contractorId: "co-3", responsibleId: "emp-2", version: 1, amount: 480000, deadline: "2026-06-17", assignedTo: "user-kam",
    createdAt: "2026-06-08", daysInStage: 4, overdueByDays: 0,
  },
  {
    id: "doc-ci2", name: "Приложение №3", type: "Приложение", direction: "contractors_internal", stage: "internal_review",
    contractorId: "co-3", responsibleId: "emp-3", version: 1, amount: null, deadline: "2026-06-16", assignedTo: "user-director",
    createdAt: "2026-06-11", daysInStage: 1, overdueByDays: 0,
  },
  {
    id: "doc-ci3", name: "Акт №12", type: "Акт", direction: "contractors_internal", stage: "with_counterparty",
    contractorId: "co-3", responsibleId: "emp-3", version: 2, amount: 480000, deadline: "2026-06-12", assignedTo: "user-producer",
    createdAt: "2026-06-09", daysInStage: 2, overdueByDays: 0,
  },
  {
    id: "doc-ci4", name: "УПД №18", type: "УПД", direction: "contractors_internal", stage: "sign_us",
    contractorId: "co-4", responsibleId: "emp-1", version: 1, amount: 310000, deadline: "2026-06-09", assignedTo: "user-kam",
    createdAt: "2026-06-04", daysInStage: 3, overdueByDays: 3,
  },
  {
    id: "doc-ci5", name: "Договор №52", type: "Договор", direction: "contractors_internal", stage: "sign_them",
    contractorId: "co-1", responsibleId: "emp-2", version: 1, amount: 950000, deadline: "2026-06-12", assignedTo: "user-lawyer",
    createdAt: "2026-06-10", daysInStage: 0, overdueByDays: 0, channel: "edo",
  },
  {
    id: "doc-ci6", name: "Счёт №9", type: "Счёт", direction: "contractors_internal", stage: "signed",
    contractorId: "co-4", responsibleId: "emp-1", version: 1, amount: 310000, deadline: null, assignedTo: "user-producer",
    createdAt: "2026-06-07", daysInStage: 0, overdueByDays: 0,
  },
];

// ─── Lookup-хелперы (RAW_PROJECTS / BASE_CONTRACTORS / BASE_EMPLOYEES) ─────────

export function getProjectTitle(projectId: number | undefined): string {
  const project = RAW_PROJECTS.find((p) => p.id === projectId);
  return project ? `${project.client} · ${project.code}` : "Без проекта";
}

export function getContractorName(contractorId: string | undefined): string {
  return BASE_CONTRACTORS.find((c) => c.id === contractorId)?.company ?? "Без подрядчика";
}

export function getResponsibleName(responsibleId: string | undefined): string {
  return BASE_EMPLOYEES.find((e) => e.id === responsibleId)?.fullName ?? "Без ответственного";
}

// R6: "имя контрагента" на карточке — клиент проекта для направления «Клиенты»,
// подрядчик — для обоих направлений «Подрядчики».
export function getContragentName(doc: SoglasovanieDocument): string {
  if (doc.direction === "clients") {
    return RAW_PROJECTS.find((p) => p.id === doc.projectId)?.client ?? "—";
  }
  return getContractorName(doc.contractorId);
}

export type SoglasovanieGroupBy = "project" | "contragent";

// R5: свимлейн-заголовок по выбранной группировке.
export function getSwimlaneKeyAndTitle(doc: SoglasovanieDocument, groupBy: SoglasovanieGroupBy): { key: string; title: string } {
  if (groupBy === "contragent") {
    if (doc.direction === "clients") {
      const title = getContragentName(doc);
      return { key: `client:${title}`, title };
    }
    const title = getContractorName(doc.contractorId);
    return { key: `contractor:${doc.contractorId ?? title}`, title };
  }

  if (doc.direction === "contractors_internal") {
    const title = getContractorName(doc.contractorId);
    return { key: `contractor:${doc.contractorId ?? title}`, title };
  }

  const title = getProjectTitle(doc.projectId);
  return { key: `project:${doc.projectId ?? title}`, title };
}
