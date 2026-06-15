export const TODAY = new Date("2026-06-12");

export const STATUSES = [
  "Не создан",
  "На согласовании",
  "Отправлен ЭДО",
  "Отправлен ОРИГ",
  "Подписан ЭДО",
  "Подписан ОРИГ",
] as const;

export const FINAL_STATUSES = ["Подписан ЭДО", "Подписан ОРИГ"] as const;

export const STATUS_COLORS: Record<string, string> = {
  "Не создан": "#9CA3AF",
  "На согласовании": "#F59E0B",
  "Отправлен ЭДО": "#3B82F6",
  "Отправлен ОРИГ": "#3B82F6",
  "Подписан ЭДО": "#10B981",
  "Подписан ОРИГ": "#10B981",
};
export const STATUS_BG: Record<string, string> = {
  "Не создан": "bg-gray-100 text-gray-700",
  "На согласовании": "bg-amber-50 text-amber-700",
  "Отправлен ЭДО": "bg-blue-50 text-blue-700",
  "Отправлен ОРИГ": "bg-blue-50 text-blue-700",
  "Подписан ЭДО": "bg-emerald-50 text-emerald-700",
  "Подписан ОРИГ": "bg-emerald-50 text-emerald-700",
};

export const DOC_TYPE_ORDER = [
  "Договор",
  "Приложение",
  "ДС",
  "Заказ",
  "Счёт",
  "УПД",
  "Акт",
  "Счёт-фактура",
  "Отчёт комитента",
  "Договор агентский",
];

export const CLIENT_DOC_TYPES: Record<string, string[]> = {
  Яндекс: ["Договор", "Приложение", "ДС", "Счёт", "УПД", "Акт", "Счёт-фактура"],
  Сбер: ["Договор", "Приложение", "Заказ", "Счёт", "Акт", "Отчёт комитента"],
  Авито: ["Договор", "Приложение", "ДС", "Счёт", "УПД", "Акт"],
  "Альфа-Банк ТГ": ["Заказ", "ДС", "Договор агентский", "Счёт", "Счёт-фактура", "Акт", "УПД", "Отчёт комитента"],
};

export const MONTH_ORDER = [
  "Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];

export const PROJECT_COL_TEMPLATE = "32px minmax(160px, 16%) minmax(96px, 8%) minmax(88px, 7%) minmax(104px, 9%) minmax(120px, 11%) minmax(120px, 11%) minmax(130px, 12%) 24px minmax(135px, 12%) 24px";
export const DOC_COL_TEMPLATE = "40px minmax(140px, 14%) minmax(170px, 16%) minmax(90px, 9%) minmax(100px, 10%) minmax(130px, 11%) minmax(110px, 11%) minmax(110px, 11%) minmax(180px, 13%)";

export type FilterId = "client" | "kam" | "doctype" | "status";
export type OptionalFilterId = "direction" | "year" | "month" | "doManager" | "overdue";

export const FILTER_LABELS: Record<FilterId, string> = {
  client: "Клиент",
  kam: "КАМ",
  doctype: "Тип документа",
  status: "Статус",
};
export const OPT_FILTER_LABELS: Record<OptionalFilterId, string> = {
  direction: "Направление",
  year: "Год",
  month: "Месяц",
  doManager: "Менеджер ДО",
  overdue: "Просроченные оплаты",
};

export default {};
