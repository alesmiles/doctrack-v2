export const TODAY = new Date("2026-06-12");

export const STATUSES = [
  "Not Created",
  "Under Review",
  "Sent EDO",
  "Sent ORIG",
  "Signed EDO",
  "Signed ORIG",
] as const;

export const FINAL_STATUSES = ["Signed EDO", "Signed ORIG"] as const;

export const STATUS_COLORS: Record<string, string> = {
  "Not Created":  "#9CA3AF",
  "Under Review": "#F59E0B",
  "Sent EDO":     "#3B82F6",
  "Sent ORIG":    "#3B82F6",
  "Signed EDO":   "#10B981",
  "Signed ORIG":  "#10B981",
};
export const STATUS_BG: Record<string, string> = {
  "Not Created":  "bg-gray-100 text-gray-700",
  "Under Review": "bg-amber-50 text-amber-700",
  "Sent EDO":     "bg-blue-50 text-blue-700",
  "Sent ORIG":    "bg-blue-50 text-blue-700",
  "Signed EDO":   "bg-emerald-50 text-emerald-700",
  "Signed ORIG":  "bg-emerald-50 text-emerald-700",
};

export const DOC_TYPE_ORDER = [
  "Договор",
  "Приложение",
  "Счёт",
  "УПД",
  "Акт",
  "СФ",
];

export const CLIENT_DOC_TYPES: Record<string, string[]> = {
  Yandex:         ["Договор", "Приложение", "Счёт", "УПД", "Акт", "СФ"],
  Sber:           ["Договор", "Приложение", "Счёт", "Акт", "СФ"],
  Avito:          ["Договор", "Приложение", "Счёт", "УПД", "Акт", "СФ"],
  "Alfa-Bank TG": ["Договор", "Приложение", "Счёт", "УПД", "Акт", "СФ"],
};

export const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTH_RU: Record<string, string> = {
  January: "Январь",
  February: "Февраль",
  March: "Март",
  April: "Апрель",
  May: "Май",
  June: "Июнь",
  July: "Июль",
  August: "Август",
  September: "Сентябрь",
  October: "Октябрь",
  November: "Ноябрь",
  December: "Декабрь",
};

export const PROJECT_COL_TEMPLATE = "32px minmax(160px, 16%) minmax(96px, 8%) minmax(88px, 7%) minmax(104px, 9%) minmax(120px, 11%) minmax(120px, 11%) minmax(130px, 12%) 24px minmax(135px, 12%) 24px";
export const DOC_COL_TEMPLATE = "40px minmax(140px, 14%) minmax(170px, 16%) minmax(90px, 9%) minmax(100px, 10%) minmax(130px, 11%) minmax(110px, 11%) minmax(110px, 11%) minmax(180px, 13%)";

export type FilterId = "client" | "kam" | "doctype" | "status";
export type OptionalFilterId = "direction" | "year" | "month" | "doManager" | "overdue";

export const FILTER_LABELS: Record<FilterId, string> = {
  client:  "Client",
  kam:     "KAM",
  doctype: "Doc Type",
  status:  "Status",
};
export const OPT_FILTER_LABELS: Record<OptionalFilterId, string> = {
  direction: "Direction",
  year:      "Year",
  month:     "Month",
  doManager: "Doc Manager",
  overdue:   "Overdue Payments",
};

export default {};
