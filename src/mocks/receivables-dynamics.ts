// ── Period helpers ─────────────────────────────────────────────────────────────
// index: 0=Ноя 2025, 1=Дек 2025, 2=Янв 2026 … 7=Июн 2026

export const ALL_MONTHS = ["Ноя", "Дек", "Янв", "Фев", "Мар", "Апр", "Май", "Июн"] as const;

export type PeriodKey = "6m" | "ytd" | "1y";

export const PERIOD_SLICES: Record<PeriodKey, { start: number; end: number }> = {
  "6m":  { start: 2, end: 7 }, // Янв–Июн 2026
  "ytd": { start: 2, end: 7 }, // Янв–Июн 2026
  "1y":  { start: 0, end: 7 }, // Ноя 2025–Июн 2026 (все 8)
};

// ── KPI values per period ──────────────────────────────────────────────────────

export const kpiByPeriod: Record<PeriodKey, {
  total: number; overdue: number; overdueCount: number; totalCount: number;
  medianDays: number; maxDays: number; collectedPct: number; collected: number;
}> = {
  "6m":  { total: 12_400_000, overdue: 3_800_000, overdueCount: 14, totalCount: 30, medianDays: 18, maxDays: 47, collectedPct: 68, collected: 8_400_000 },
  "ytd": { total: 12_400_000, overdue: 3_800_000, overdueCount: 14, totalCount: 30, medianDays: 18, maxDays: 47, collectedPct: 68, collected: 8_400_000 },
  "1y":  { total: 18_200_000, overdue: 5_100_000, overdueCount: 19, totalCount: 44, medianDays: 22, maxDays: 61, collectedPct: 72, collected: 13_100_000 },
};

// ── Bar chart data — 6m / ytd ──────────────────────────────────────────────────

export const debtByClient = [
  { client: "Яндекс",        total: 2_200_000, overdue: 950_000 },
  { client: "Сбер",          total: 1_800_000, overdue: 0 },
  { client: "РусТех",        total: 1_600_000, overdue: 640_000 },
  { client: "Альфа Медиа",   total: 1_350_000, overdue: 870_000 },
  { client: "Авито",         total: 1_100_000, overdue: 300_000 },
  { client: "Медиа Плюс",    total: 850_000,   overdue: 0 },
  { client: "Бриз",          total: 700_000,   overdue: 200_000 },
  { client: "ГеоТех",        total: 600_000,   overdue: 0 },
  { client: "Форте",         total: 500_000,   overdue: 150_000 },
  { client: "НовоТех",       total: 400_000,   overdue: 0 },
  { client: "Стройком",      total: 350_000,   overdue: 90_000 },
  { client: "АгроЛайф",     total: 300_000,   overdue: 0 },
  { client: "Диджитал Груп", total: 250_000,   overdue: 0 },
  { client: "ЭкоСтрой",     total: 200_000,   overdue: 0 },
];

export const debtByKam = [
  { kam: "Кирилл П.", total: 4_850_000, overdue: 1_590_000 },
  { kam: "Алина С.",  total: 4_200_000, overdue: 1_350_000 },
  { kam: "Полина В.", total: 3_350_000, overdue: 860_000 },
];

export const aging = [
  { bucket: "1–7 дн",   amount: 920_000,   clients: 4 },
  { bucket: "8–30 дн",  amount: 2_080_000, clients: 6 },
  { bucket: "31–60 дн", amount: 680_000,   clients: 3 },
  { bucket: "60+ дн",   amount: 120_000,   clients: 1 },
];

export const delayReasons = [
  { reason: "Нет оригинала",    clients: 5 },
  { reason: "Спор по акту",     clients: 3 },
  { reason: "Финанс. задержка", clients: 3 },
  { reason: "Нет контакта",     clients: 2 },
  { reason: "Прочее",           clients: 1 },
];

// ── Bar chart data — 1y (scaled up) ───────────────────────────────────────────

const debtByClient1y = [
  { client: "Яндекс",        total: 3_200_000, overdue: 1_350_000 },
  { client: "Сбер",          total: 2_600_000, overdue: 0 },
  { client: "РусТех",        total: 2_400_000, overdue: 900_000 },
  { client: "Альфа Медиа",   total: 2_100_000, overdue: 1_200_000 },
  { client: "Авито",         total: 1_700_000, overdue: 450_000 },
  { client: "Медиа Плюс",    total: 1_200_000, overdue: 0 },
  { client: "Бриз",          total: 1_050_000, overdue: 280_000 },
  { client: "ГеоТех",        total: 900_000,   overdue: 0 },
  { client: "Форте",         total: 750_000,   overdue: 220_000 },
  { client: "НовоТех",       total: 600_000,   overdue: 0 },
  { client: "Стройком",      total: 520_000,   overdue: 130_000 },
  { client: "АгроЛайф",     total: 450_000,   overdue: 0 },
  { client: "Диджитал Груп", total: 370_000,   overdue: 0 },
  { client: "ЭкоСтрой",     total: 300_000,   overdue: 0 },
];

const debtByKam1y = [
  { kam: "Кирилл П.", total: 7_100_000, overdue: 2_200_000 },
  { kam: "Алина С.",  total: 6_140_000, overdue: 1_850_000 },
  { kam: "Полина В.", total: 4_960_000, overdue: 1_050_000 },
];

// Aging 1y: sum ≈ 5_100_000, total clients = 19
const aging1y = [
  { bucket: "1–7 дн",   amount: 1_350_000, clients: 6 },
  { bucket: "8–30 дн",  amount: 2_400_000, clients: 8 },
  { bucket: "31–60 дн", amount: 950_000,   clients: 4 },
  { bucket: "60+ дн",   amount: 400_000,   clients: 1 },
];

const delayReasons1y = [
  { reason: "Нет оригинала",    clients: 7 },
  { reason: "Спор по акту",     clients: 4 },
  { reason: "Финанс. задержка", clients: 4 },
  { reason: "Нет контакта",     clients: 3 },
  { reason: "Прочее",           clients: 1 },
];

// ── Bundled per-period bar data ────────────────────────────────────────────────

export const barDataByPeriod: Record<PeriodKey, {
  debtByClient: typeof debtByClient;
  debtByKam: typeof debtByKam;
  aging: typeof aging;
  delayReasons: typeof delayReasons;
}> = {
  "6m":  { debtByClient, debtByKam, aging, delayReasons },
  "ytd": { debtByClient, debtByKam, aging, delayReasons },
  "1y":  { debtByClient: debtByClient1y, debtByKam: debtByKam1y, aging: aging1y, delayReasons: delayReasons1y },
};

// ── Trend series (all 8 months, sliced in DynamicsTab by period) ───────────────

export const companyTrend = ALL_MONTHS.map((month, i) => ({
  month,
  overdue:    [1_200_000, 1_450_000, 1_800_000, 2_200_000, 2_900_000, 3_400_000, 3_600_000, 3_800_000][i],
  medianDays: [8, 11, 13, 15, 17, 19, 20, 18][i],
}));

const CLIENT_DEBT  = [400, 600, 900, 1100, 1500, 1800, 2000, 2200].map(v => v * 1000);
const CLIENT_DAYS  = [0, 5, 10, 14, 20, 28, 30, 22];
const SBER_DEBT    = [600, 800, 1000, 1200, 1500, 1700, 1800, 1800].map(v => v * 1000);
const RUSTECH_DEBT = [200, 300, 500, 700, 900, 1200, 1500, 1600].map(v => v * 1000);
const RUSTECH_DAYS = [0, 0, 7, 10, 15, 18, 20, 24];
const ALFA_DEBT    = [100, 200, 400, 700, 900, 1100, 1200, 1350].map(v => v * 1000);
const ALFA_DAYS    = [5, 12, 18, 22, 30, 38, 40, 35];
const AVITO_DEBT   = [0, 100, 200, 400, 600, 800, 950, 1100].map(v => v * 1000);
const AVITO_DAYS   = [0, 0, 0, 8, 12, 15, 18, 20];
const MEDIA_DEBT   = [200, 300, 400, 500, 600, 700, 800, 850].map(v => v * 1000);

export const clientTrend: Record<string, { month: string; debt: number; days: number }[]> = {
  "Яндекс":      ALL_MONTHS.map((m, i) => ({ month: m, debt: CLIENT_DEBT[i],  days: CLIENT_DAYS[i] })),
  "Сбер":        ALL_MONTHS.map((m, i) => ({ month: m, debt: SBER_DEBT[i],    days: 0 })),
  "РусТех":      ALL_MONTHS.map((m, i) => ({ month: m, debt: RUSTECH_DEBT[i], days: RUSTECH_DAYS[i] })),
  "Альфа Медиа": ALL_MONTHS.map((m, i) => ({ month: m, debt: ALFA_DEBT[i],    days: ALFA_DAYS[i] })),
  "Авито":       ALL_MONTHS.map((m, i) => ({ month: m, debt: AVITO_DEBT[i],   days: AVITO_DAYS[i] })),
  "Медиа Плюс":  ALL_MONTHS.map((m, i) => ({ month: m, debt: MEDIA_DEBT[i],   days: 0 })),
};

const KP_DEBT = [600, 900, 1300, 1800, 2400, 2900, 3200, 4850].map(v => v * 1000);
const KP_DAYS = [5, 8, 12, 15, 18, 22, 24, 20];
const AS_DEBT = [500, 700, 1000, 1500, 2000, 2800, 3500, 4200].map(v => v * 1000);
const AS_DAYS = [0, 4, 8, 12, 16, 20, 22, 18];
const PV_DEBT = [300, 500, 800, 1200, 1800, 2400, 3000, 3350].map(v => v * 1000);
const PV_DAYS = [0, 0, 5, 8, 12, 15, 16, 14];

export const kamTrend: Record<string, { month: string; debt: number; days: number }[]> = {
  "Кирилл П.": ALL_MONTHS.map((m, i) => ({ month: m, debt: KP_DEBT[i], days: KP_DAYS[i] })),
  "Алина С.":  ALL_MONTHS.map((m, i) => ({ month: m, debt: AS_DEBT[i], days: AS_DAYS[i] })),
  "Полина В.": ALL_MONTHS.map((m, i) => ({ month: m, debt: PV_DEBT[i], days: PV_DAYS[i] })),
};

// ── Month-key types and per-month KPI ─────────────────────────────────────────

export type MonthKey = 'Июнь 2026' | 'Июль 2026' | 'Август 2026' | 'Весь период';

type KpiData = {
  total: number; overdue: number; overdueCount: number; totalCount: number;
  medianDays: number; maxDays: number; collectedPct: number; collected: number;
};

export const kpiByMonth: Record<MonthKey, KpiData> = {
  'Июнь 2026':  { total: 12_400_000, overdue: 3_800_000, overdueCount: 14, totalCount: 30, medianDays: 18, maxDays: 47, collectedPct: 68, collected: 8_400_000 },
  'Июль 2026':  { total: 8_200_000,  overdue: 2_100_000, overdueCount: 8,  totalCount: 19, medianDays: 14, maxDays: 35, collectedPct: 0,  collected: 0 },
  'Август 2026': { total: 5_600_000,  overdue: 0,         overdueCount: 0,  totalCount: 12, medianDays: 0,  maxDays: 0,  collectedPct: 0,  collected: 0 },
  'Весь период': { total: 26_200_000, overdue: 3_800_000, overdueCount: 14, totalCount: 61, medianDays: 18, maxDays: 47, collectedPct: 26, collected: 8_400_000 },
};

// ── Per-month bar chart data ───────────────────────────────────────────────────

type ClientRow  = { client: string; total: number; overdue: number };
type KamRow     = { kam:    string; total: number; overdue: number };
type AgingRow   = { bucket: string; amount: number; clients: number };
type ReasonRow  = { reason: string; clients: number };

type BarDataSet = {
  debtByClient: ClientRow[];
  debtByKam:    KamRow[];
  aging:        AgingRow[];
  delayReasons: ReasonRow[];
};

// July — future, nothing overdue yet
const debtByClientJul: ClientRow[] = [
  { client: "Диджитал Груп", total: 1_800_000, overdue: 0 },
  { client: "Стройком",      total: 750_000,   overdue: 0 },
  { client: "Яндекс",        total: 600_000,   overdue: 0 },
  { client: "Авито",         total: 400_000,   overdue: 0 },
  { client: "РусТех",        total: 300_000,   overdue: 0 },
  { client: "Бриз",          total: 350_000,   overdue: 0 },
];
const debtByKamJul: KamRow[] = [
  { kam: "Кирилл П.", total: 2_200_000, overdue: 0 },
  { kam: "Алина С.",  total: 1_500_000, overdue: 0 },
  { kam: "Полина В.", total: 1_500_000, overdue: 0 },
];
const agingJul: AgingRow[] = [
  { bucket: "1–7 дн",   amount: 0, clients: 0 },
  { bucket: "8–30 дн",  amount: 0, clients: 0 },
  { bucket: "31–60 дн", amount: 0, clients: 0 },
  { bucket: "60+ дн",   amount: 0, clients: 0 },
];
const delayReasonsJul: ReasonRow[] = [
  { reason: "Нет оригинала",    clients: 0 },
  { reason: "Спор по акту",     clients: 0 },
  { reason: "Финанс. задержка", clients: 0 },
  { reason: "Нет контакта",     clients: 0 },
  { reason: "Прочее",           clients: 0 },
];

// August — further future, smaller amounts
const debtByClientAug: ClientRow[] = [
  { client: "Яндекс",  total: 900_000, overdue: 0 },
  { client: "Сбер",    total: 700_000, overdue: 0 },
  { client: "РусТех",  total: 500_000, overdue: 0 },
  { client: "Форте",   total: 450_000, overdue: 0 },
  { client: "Бриз",    total: 350_000, overdue: 0 },
];
const debtByKamAug: KamRow[] = [
  { kam: "Алина С.",  total: 1_200_000, overdue: 0 },
  { kam: "Кирилл П.", total: 900_000,   overdue: 0 },
  { kam: "Полина В.", total: 800_000,   overdue: 0 },
];
const agingAug: AgingRow[] = [
  { bucket: "1–7 дн",   amount: 0, clients: 0 },
  { bucket: "8–30 дн",  amount: 0, clients: 0 },
  { bucket: "31–60 дн", amount: 0, clients: 0 },
  { bucket: "60+ дн",   amount: 0, clients: 0 },
];
const delayReasonsAug: ReasonRow[] = [
  { reason: "Нет оригинала",    clients: 0 },
  { reason: "Спор по акту",     clients: 0 },
  { reason: "Финанс. задержка", clients: 0 },
  { reason: "Нет контакта",     clients: 0 },
  { reason: "Прочее",           clients: 0 },
];

// All period — aggregate Jun + Jul + Aug
const debtByClientAll: ClientRow[] = [
  { client: "Яндекс",        total: 3_700_000, overdue: 950_000 },
  { client: "Диджитал Груп", total: 2_050_000, overdue: 0 },
  { client: "Сбер",          total: 2_500_000, overdue: 0 },
  { client: "РусТех",        total: 2_400_000, overdue: 640_000 },
  { client: "Альфа Медиа",   total: 1_700_000, overdue: 870_000 },
  { client: "Стройком",      total: 1_100_000, overdue: 0 },
  { client: "Авито",         total: 1_500_000, overdue: 300_000 },
  { client: "Бриз",          total: 1_400_000, overdue: 200_000 },
  { client: "Медиа Плюс",    total: 850_000,   overdue: 0 },
  { client: "ГеоТех",        total: 600_000,   overdue: 0 },
  { client: "Форте",         total: 950_000,   overdue: 150_000 },
  { client: "НовоТех",       total: 400_000,   overdue: 0 },
  { client: "АгроЛайф",      total: 300_000,   overdue: 0 },
  { client: "ЭкоСтрой",      total: 200_000,   overdue: 0 },
];
const debtByKamAll: KamRow[] = [
  { kam: "Кирилл П.", total: 9_150_000, overdue: 1_590_000 },
  { kam: "Алина С.",  total: 7_900_000, overdue: 1_350_000 },
  { kam: "Полина В.", total: 6_150_000, overdue: 860_000 },
];

export const barDataByMonth: Record<MonthKey, BarDataSet> = {
  'Июнь 2026':  { debtByClient, debtByKam, aging, delayReasons },
  'Июль 2026':  { debtByClient: debtByClientJul, debtByKam: debtByKamJul, aging: agingJul, delayReasons: delayReasonsJul },
  'Август 2026': { debtByClient: debtByClientAug, debtByKam: debtByKamAug, aging: agingAug, delayReasons: delayReasonsAug },
  'Весь период': { debtByClient: debtByClientAll, debtByKam: debtByKamAll, aging, delayReasons },
};
