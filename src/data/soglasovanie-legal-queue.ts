import { TODAY } from "@/constants";

// ─── Согласование → рабочая очередь юриста ──────────────────────────────────
// Отдельный, самостоятельный набор данных/типов для нового раздела
// «Согласование» (плоский список, см. IMPLEMENTATION_REPORT.md, задача
// «раздел Согласование — пункт в сайдбаре и страница со списком документов»).
// Не путать с src/data/soglasovanie-seed.ts и src/pages/SoglasovanieDocumentsPage.tsx
// (канбан «Согласование · Документы» из отдельной, ранее выполненной задачи
// «Блок 7 · На подписи») — те не трогались, это независимая фича с похожим
// названием в ТЗ, но другой моделью данных (2 направления вместо 3, плоский
// статус-флоу вместо 5-стадийного канбана).

export type LegalQueueDirection = "client" | "contractor";

// R (доработка 4): "done" — реальный терминальный статус вычитки подрядчика
// ("отправлено подрядчику"), а не разовое действие вне enum'а, как было в
// первой версии этой фичи — строки больше не удаляются физически, только
// скрываются (см. isTerminalStatus / доработка 5).
export type ClientQueueStatus = "new" | "in_progress" | "waiting_client" | "approved";
export type ContractorQueueStatus = "new" | "in_progress" | "done";
export type LegalQueueStatus = ClientQueueStatus | ContractorQueueStatus;

export const DIRECTION_LABELS: Record<LegalQueueDirection, string> = {
  client: "Клиент",
  contractor: "Подрядчик",
};

export const CLIENT_STATUS_LABELS: Record<ClientQueueStatus, string> = {
  new: "Новое",
  in_progress: "В работе",
  waiting_client: "Отправлено, ждём клиента",
  approved: "Согласовано",
};

export const CONTRACTOR_STATUS_LABELS: Record<ContractorQueueStatus, string> = {
  new: "Новое",
  in_progress: "В работе",
  done: "Отправлено подрядчику",
};

export const CLIENT_STATUS_ORDER: ClientQueueStatus[] = ["new", "in_progress", "waiting_client", "approved"];
export const CONTRACTOR_STATUS_ORDER: ContractorQueueStatus[] = ["new", "in_progress", "done"];

// R (доработка 3/4): статус больше не редактируется напрямую в таблице —
// значение меняется только через действия ("Взять в работу"/"Отправить
// клиенту"/… ), доступные в боковой панели. Список допустимых переходов —
// конфиг по направлению, а не условие в компоненте строки/страницы.
export interface StatusAction {
  targetStatus: LegalQueueStatus;
  label: string;
}

export const CLIENT_TRANSITIONS: Record<ClientQueueStatus, StatusAction[]> = {
  new: [{ targetStatus: "in_progress", label: "Взять в работу" }],
  in_progress: [{ targetStatus: "waiting_client", label: "Отправить клиенту" }],
  waiting_client: [
    { targetStatus: "in_progress", label: "Получены правки" },
    { targetStatus: "approved", label: "Согласовано" },
  ],
  approved: [],
};

export const CONTRACTOR_TRANSITIONS: Record<ContractorQueueStatus, StatusAction[]> = {
  new: [{ targetStatus: "in_progress", label: "Взять в работу" }],
  in_progress: [{ targetStatus: "done", label: "Отправить подрядчику" }],
  done: [],
};

export function getAvailableActions(doc: LegalQueueDocument): StatusAction[] {
  return doc.direction === "client"
    ? CLIENT_TRANSITIONS[doc.status as ClientQueueStatus]
    : CONTRACTOR_TRANSITIONS[doc.status as ContractorQueueStatus];
}

// Терминальный статус: строка выполнила свой путь в очереди юриста и по
// умолчанию скрыта из таблицы (доработка 5), но не удаляется из данных.
export function isTerminalStatus(doc: LegalQueueDocument): boolean {
  return doc.direction === "client" ? doc.status === "approved" : doc.status === "done";
}

export interface RevisionEntry {
  date: string; // DD.MM.YYYY
  author: string;
  text: string;
}

export interface LegalQueueDocument {
  id: string;
  name: string;
  docType?: string; // УПД / Счёт / Договор и т.п. — под названием, мелким серым
  direction: LegalQueueDirection;
  status: LegalQueueStatus;
  revisionRound: number; // 0 = "Первичный", N >= 1 = "С правками · N"
  counterparty: string;
  responsible: string;
  deadline: string | null; // YYYY-MM-DD
  waitingSince: string | null; // YYYY-MM-DD — только для status === "waiting_client"
  revisions: RevisionEntry[];
}

export const TODAY_ISO = TODAY.toISOString().slice(0, 10);

export function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < TODAY;
}

export function overdueDays(deadline: string | null): number {
  if (!deadline) return 0;
  const diff = Math.floor((TODAY.getTime() - new Date(deadline).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

export function waitingDays(waitingSince: string | null): number {
  if (!waitingSince) return 0;
  const diff = Math.floor((TODAY.getTime() - new Date(waitingSince).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

export const LEGAL_QUEUE_DOCUMENTS: LegalQueueDocument[] = [
  // ─── Клиенты ────────────────────────────────────────────────────────────
  {
    id: "lq-c1", name: "Договор №112", docType: "Договор", direction: "client",
    status: "new", revisionRound: 0, counterparty: "Яндекс", responsible: "Ольга Заречная",
    deadline: "2026-06-20", waitingSince: null, revisions: [],
  },
  {
    id: "lq-c2", name: "Договор №98", docType: "Договор", direction: "client",
    status: "in_progress", revisionRound: 2, counterparty: "Сбер", responsible: "Ольга Заречная",
    deadline: "2026-06-05", waitingSince: null,
    revisions: [
      { date: "28.05.2026", author: "Сбер (юрдеп.)", text: "Правки в п. 4.2 — просят снизить неустойку до 0.1%." },
      { date: "02.06.2026", author: "Ольга Заречная", text: "Внесены правки, отправлено повторно." },
      { date: "04.06.2026", author: "Сбер (юрдеп.)", text: "Ещё правки — уточнить срок действия договора в п. 8." },
    ],
  },
  {
    id: "lq-c3", name: "Приложение №7", docType: "Приложение", direction: "client",
    status: "waiting_client", revisionRound: 0, counterparty: "Авито", responsible: "Марк Сомов",
    deadline: "2026-06-18", waitingSince: "2026-06-09",
    revisions: [{ date: "09.06.2026", author: "Марк Сомов", text: "Приложение отправлено клиенту на подпись." }],
  },
  {
    id: "lq-c4", name: "УПД №44", docType: "УПД", direction: "client",
    status: "in_progress", revisionRound: 1, counterparty: "Авито", responsible: "Ольга Заречная",
    deadline: "2026-06-15", waitingSince: null,
    revisions: [{ date: "10.06.2026", author: "Авито (бухгалтерия)", text: "Не совпадает сумма НДС — просят перевыставить УПД." }],
  },
  {
    id: "lq-c5", name: "Акт №21", docType: "Акт", direction: "client",
    status: "new", revisionRound: 0, counterparty: "Альфа-Банк ТГ", responsible: "Инна Михрабова",
    deadline: null, waitingSince: null, revisions: [],
  },
  {
    id: "lq-c6", name: "Счёт №15", docType: "Счёт", direction: "client",
    status: "in_progress", revisionRound: 3, counterparty: "МТС", responsible: "Марк Сомов",
    deadline: "2026-06-11", waitingSince: null,
    revisions: [
      { date: "01.06.2026", author: "МТС (бухгалтерия)", text: "Неверные реквизиты получателя." },
      { date: "03.06.2026", author: "Марк Сомов", text: "Реквизиты исправлены, счёт переотправлен." },
      { date: "06.06.2026", author: "МТС (бухгалтерия)", text: "Нужно разбить счёт на 2 позиции по разным КБК." },
    ],
  },
  {
    id: "lq-c7", name: "СФ №9", docType: "СФ", direction: "client",
    status: "waiting_client", revisionRound: 0, counterparty: "Wildberries", responsible: "Ольга Заречная",
    deadline: "2026-06-14", waitingSince: "2026-06-08",
    revisions: [{ date: "08.06.2026", author: "Ольга Заречная", text: "Счёт-фактура отправлена клиенту." }],
  },

  // ─── Подрядчики ─────────────────────────────────────────────────────────
  // R (доработка «фильтры»): counterparty приведён к реальным компаниям из
  // BASE_CONTRACTORS (src/mocks/baseContractors.ts) — раньше здесь были
  // придуманные названия ("ООО СтройГрупп" и т.п.), не совпадавшие ни с одной
  // записью справочника. Фильтр «Контрагент» берёт список именно из
  // справочника «База», и с прежними значениями ни один пункт списка не
  // находил бы ни одной строки для направления «Подрядчик» — см. допущение
  // в IMPLEMENTATION_REPORT.md.
  {
    id: "lq-p1", name: "Акт №9", docType: "Акт", direction: "contractor",
    status: "new", revisionRound: 0, counterparty: "МедиаКрафт", responsible: "Ольга Заречная",
    deadline: "2026-06-13", waitingSince: null, revisions: [],
  },
  {
    id: "lq-p2", name: "Договор подряда №5", docType: "Договор", direction: "contractor",
    status: "in_progress", revisionRound: 1, counterparty: "Инфлюенс Групп", responsible: "Ольга Заречная",
    deadline: "2026-06-10", waitingSince: null,
    revisions: [{ date: "05.06.2026", author: "Ольга Заречная", text: "Замечание к разделу ответственности сторон — п. 6.3 требует уточнения." }],
  },
  {
    id: "lq-p3", name: "УПД №14", docType: "УПД", direction: "contractor",
    status: "new", revisionRound: 0, counterparty: "СтудияПро", responsible: "Марк Сомов",
    deadline: null, waitingSince: null, revisions: [],
  },
  {
    id: "lq-p4", name: "Приложение №3", docType: "Приложение", direction: "contractor",
    status: "in_progress", revisionRound: 2, counterparty: "АдТех Solutions", responsible: "Ольга Заречная",
    deadline: "2026-06-19", waitingSince: null,
    revisions: [
      { date: "07.06.2026", author: "Ольга Заречная", text: "Не указана смета — вернуть подрядчику на доработку." },
      { date: "09.06.2026", author: "Ольга Заречная", text: "Смета приложена, но не совпадает с договором — повторная правка." },
    ],
  },
];
