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
  responsibleId?: string; // BASE_EMPLOYEES.id — "Ответственный"
  version: number;
  amount: number | null;
  deadline: string | null;
  assignedTo: string; // DEMO_USERS.id
  createdAt: string;
  daysInStage: number;
  overdueByDays: number; // 0 — не просрочен
  channel?: "edo";
  autoHideInDays?: number; // override DEFAULT_AUTO_HIDE_DAYS для этой карточки
  // R11 (Блок 7 · На подписи): момент постановки в очередь на подпись директора —
  // задан только для stage === "sign_us", используется для сортировки по умолчанию.
  queuedAt?: string;
  // R16 (Блок 7 · На подписи): есть замечание юриста — исключает строку из
  // «выбрать всё», не мешает подписанию по кнопке в строке.
  hasLawyerNote?: boolean;
  // R22 (Ревизия 1 · Блок 7 · На подписи): контрагенты в RAW_PROJECTS/
  // BASE_CONTRACTORS ограничены 4–5 реальными компаниями — для проверяемого
  // разнообразия фильтров (12 клиентов) часть документов направления
  // "clients" ссылается на синтетическую компанию через это поле вместо
  // projectId. getContragentName() проверяет его в первую очередь.
  contragentNameOverride?: string;
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
    projectId: 4, responsibleId: "emp-2", version: 2, amount: 8900000, deadline: "2026-06-14", assignedTo: "user-director",
    createdAt: "2026-06-09", daysInStage: 1, overdueByDays: 0, queuedAt: "2026-06-10T09:15:00",
  },
  {
    id: "doc-c9", name: "Акт №33", type: "Акт", direction: "clients", stage: "sign_us",
    projectId: 3, responsibleId: "emp-2", version: 1, amount: 3600000, deadline: "2026-06-16", assignedTo: "user-director",
    createdAt: "2026-06-08", daysInStage: 4, overdueByDays: 0, queuedAt: "2026-06-08T16:45:00",
  },
  // R22 (Ревизия 1): ещё 10 клиентов в очереди директора — 2 через реальный
  // projectId (Авито, Альфа-Банк ТГ), 8 через contragentNameOverride (в
  // RAW_PROJECTS этих компаний нет) — итого 12 разных клиентов в очереди.
  {
    id: "doc-c10", name: "Договор №201", type: "Договор", direction: "clients", stage: "sign_us",
    projectId: 7, responsibleId: "emp-2", version: 1, amount: 1450000, deadline: "2026-06-13", assignedTo: "user-director",
    createdAt: "2026-06-05", daysInStage: 2, overdueByDays: 0, queuedAt: "2026-06-07T10:00:00",
  },
  {
    id: "doc-c11", name: "Приложение №5", type: "Приложение", direction: "clients", stage: "sign_us",
    projectId: 10, responsibleId: "emp-3", version: 1, amount: 2650000, deadline: "2026-06-09", assignedTo: "user-director",
    createdAt: "2026-06-03", daysInStage: 3, overdueByDays: 3, queuedAt: "2026-06-06T09:30:00",
  },
  {
    id: "doc-c12", name: "Акт №44", type: "Акт", direction: "clients", stage: "sign_us",
    contragentNameOverride: "Тинькофф", responsibleId: "emp-1", version: 1, amount: 980000, deadline: "2026-06-18", assignedTo: "user-director",
    createdAt: "2026-06-10", daysInStage: 1, overdueByDays: 0, queuedAt: "2026-06-11T13:00:00",
  },
  {
    id: "doc-c13", name: "УПД №77", type: "УПД", direction: "clients", stage: "sign_us",
    contragentNameOverride: "МТС", responsibleId: "emp-2", version: 1, amount: 540000, deadline: "2026-06-11", assignedTo: "user-director",
    createdAt: "2026-06-06", daysInStage: 3, overdueByDays: 1, queuedAt: "2026-06-09T15:00:00",
  },
  {
    id: "doc-c14", name: "Договор №305", type: "Договор", direction: "clients", stage: "sign_us",
    contragentNameOverride: "Ozon", responsibleId: "emp-3", version: 1, amount: 3200000, deadline: "2026-06-20", assignedTo: "user-director",
    createdAt: "2026-06-02", daysInStage: 5, overdueByDays: 0, queuedAt: "2026-06-05T11:20:00",
  },
  {
    id: "doc-c15", name: "Счёт №88", type: "Счёт", direction: "clients", stage: "sign_us",
    contragentNameOverride: "Wildberries", responsibleId: "emp-1", version: 1, amount: 1120000, deadline: "2026-06-07", assignedTo: "user-director",
    createdAt: "2026-06-01", daysInStage: 6, overdueByDays: 5, queuedAt: "2026-06-04T08:45:00",
  },
  {
    id: "doc-c16", name: "СФ №12", type: "СФ", direction: "clients", stage: "sign_us",
    contragentNameOverride: "ВТБ", responsibleId: "emp-2", version: 1, amount: 670000, deadline: "2026-06-22", assignedTo: "user-director",
    createdAt: "2026-06-11", daysInStage: 1, overdueByDays: 0, queuedAt: "2026-06-12T07:30:00",
  },
  {
    id: "doc-c17", name: "Приложение №9", type: "Приложение", direction: "clients", stage: "sign_us",
    contragentNameOverride: "Ростелеком", responsibleId: "emp-3", version: 1, amount: null, deadline: "2026-06-14", assignedTo: "user-director",
    createdAt: "2026-06-07", daysInStage: 4, overdueByDays: 0, queuedAt: "2026-06-08T14:10:00",
  },
  {
    id: "doc-c18", name: "Акт №61", type: "Акт", direction: "clients", stage: "sign_us",
    contragentNameOverride: "X5 Group", responsibleId: "emp-1", version: 1, amount: 2340000, deadline: "2026-06-10", assignedTo: "user-director",
    createdAt: "2026-06-09", daysInStage: 2, overdueByDays: 2, queuedAt: "2026-06-10T16:40:00",
  },
  {
    id: "doc-c19", name: "УПД №90", type: "УПД", direction: "clients", stage: "sign_us",
    contragentNameOverride: "Магнит", responsibleId: "emp-2", version: 1, amount: 810000, deadline: "2026-06-19", assignedTo: "user-director",
    createdAt: "2026-06-01", daysInStage: 7, overdueByDays: 0, queuedAt: "2026-06-03T12:00:00",
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
    contractorId: "co-2", projectId: 7, responsibleId: "emp-3", version: 1, amount: 620000, deadline: "2026-06-08", assignedTo: "user-director",
    createdAt: "2026-06-02", daysInStage: 4, overdueByDays: 4, queuedAt: "2026-06-11T14:30:00",
  },
  // R22 (Ревизия 1): ещё 3 подрядчика-клиента в очереди директора (co-1/co-3/co-4) — итого 4.
  {
    id: "doc-cc7", name: "Договор подряда №12", type: "Договор", direction: "contractors_client", stage: "sign_us",
    contractorId: "co-1", responsibleId: "emp-2", version: 1, amount: 870000, deadline: "2026-06-16", assignedTo: "user-director",
    createdAt: "2026-06-04", daysInStage: 2, overdueByDays: 0, queuedAt: "2026-06-06T10:15:00",
  },
  {
    id: "doc-cc8", name: "Приложение №11", type: "Приложение", direction: "contractors_client", stage: "sign_us",
    contractorId: "co-3", responsibleId: "emp-1", version: 1, amount: null, deadline: "2026-06-09", assignedTo: "user-director",
    createdAt: "2026-06-05", daysInStage: 2, overdueByDays: 3, queuedAt: "2026-06-07T09:00:00",
  },
  {
    id: "doc-cc9", name: "Акт №25", type: "Акт", direction: "contractors_client", stage: "sign_us",
    contractorId: "co-4", responsibleId: "emp-3", version: 1, amount: 540000, deadline: "2026-06-21", assignedTo: "user-director",
    createdAt: "2026-06-08", daysInStage: 1, overdueByDays: 0, queuedAt: "2026-06-09T13:30:00",
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
    createdAt: "2026-06-04", daysInStage: 3, overdueByDays: 3, queuedAt: "2026-06-09T11:00:00",
  },
  {
    id: "doc-ci7", name: "Акт №19", type: "Акт", direction: "contractors_internal", stage: "sign_us",
    contractorId: "co-3", responsibleId: "emp-3", version: 1, amount: 480000, deadline: "2026-06-10", assignedTo: "user-director",
    createdAt: "2026-06-12", daysInStage: 0, overdueByDays: 2, queuedAt: "2026-06-12T08:00:00", hasLawyerNote: true,
  },
  // R22 (Ревизия 1): ещё 3 подрядчика-внутр. в очереди директора (co-1/co-2/co-4) — итого 4.
  {
    id: "doc-ci8", name: "УПД №30", type: "УПД", direction: "contractors_internal", stage: "sign_us",
    contractorId: "co-1", responsibleId: "emp-2", version: 1, amount: 410000, deadline: "2026-06-08", assignedTo: "user-director",
    createdAt: "2026-06-03", daysInStage: 5, overdueByDays: 4, queuedAt: "2026-06-05T09:50:00",
  },
  {
    id: "doc-ci9", name: "Договор №70", type: "Договор", direction: "contractors_internal", stage: "sign_us",
    contractorId: "co-2", responsibleId: "emp-3", version: 1, amount: 1650000, deadline: "2026-06-17", assignedTo: "user-director",
    createdAt: "2026-06-04", daysInStage: 4, overdueByDays: 0, queuedAt: "2026-06-06T15:20:00",
  },
  {
    id: "doc-ci10", name: "Приложение №15", type: "Приложение", direction: "contractors_internal", stage: "sign_us",
    contractorId: "co-4", responsibleId: "emp-1", version: 1, amount: null, deadline: "2026-06-13", assignedTo: "user-director",
    createdAt: "2026-06-10", daysInStage: 1, overdueByDays: 0, queuedAt: "2026-06-11T11:10:00",
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
// R22 (Ревизия 1 · Блок 7 · На подписи): contragentNameOverride имеет приоритет
// над projectId — см. комментарий у поля в SoglasovanieDocument.
export function getContragentName(doc: SoglasovanieDocument): string {
  if (doc.contragentNameOverride) return doc.contragentNameOverride;
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
