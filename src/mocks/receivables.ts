// КАМы консистентны с разделом «Клиенты»: Кирилл П. (КП), Алина С. (АС), Полина В. (ПВ)
export interface ReceivablePayment {
  id: number;
  description: string;
  docRef: string;
  amount: number;
  responsible: { initials: string; name: string };
  planDate: string;
  factDate: string | null;
  delayReason: string | null;
}

export interface ReceivableProject {
  id: number;
  client: string;
  projectCode: string;
  direction: string;
  payments: ReceivablePayment[];
}

const KP = { initials: "КП", name: "Кирилл П." };
const AS = { initials: "АС", name: "Алина С." };
const PV = { initials: "ПВ", name: "Полина В." };

// Ровно 3 проекта с просроченными платежами (TODAY = 2026-06-12):
// ALF-8 (pay1, plan 27.05), GEO-1 (pay4, plan 01.06), BRZ-3 (pay5, plan 04.06)
export const RECEIVABLE_PROJECTS: ReceivableProject[] = [
  {
    id: 1, client: "Альфа Медиа", projectCode: "ALF-8", direction: "Инфлюенс",
    payments: [
      { id: 1,  description: "Аванс 50%",         docRef: "Счёт №112", amount: 3_500_000, responsible: KP, planDate: "27.05.2026", factDate: null,         delayReason: "Задержка согласования" },
      { id: 2,  description: "Постоплата 50%",     docRef: "Счёт №115", amount: 4_000_000, responsible: KP, planDate: "20.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 2, client: "ГеоТех", projectCode: "GEO-1", direction: "Контекст",
    payments: [
      { id: 3,  description: "Аванс",              docRef: "Счёт №98",  amount: 2_400_000, responsible: AS, planDate: "25.04.2026", factDate: "25.04.2026", delayReason: null },
      { id: 4,  description: "Постоплата по акту", docRef: "Счёт №104", amount: 1_900_000, responsible: AS, planDate: "01.06.2026", factDate: null,         delayReason: "Ожидают закрывающие документы" },
    ],
  },
  {
    id: 3, client: "Бриз", projectCode: "BRZ-3", direction: "Медиа",
    payments: [
      { id: 5,  description: "Оплата за услуги",   docRef: "Счёт №87",  amount: 2_100_000, responsible: PV, planDate: "04.06.2026", factDate: null,         delayReason: null },
      { id: 6,  description: "Гарантийный платёж", docRef: "Счёт №91",  amount: 1_500_000, responsible: PV, planDate: "30.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 4, client: "РусТех", projectCode: "RST-2", direction: "PR",
    payments: [
      { id: 7,  description: "Аванс 30%",          docRef: "Счёт №67",  amount: 1_800_000, responsible: KP, planDate: "01.04.2026", factDate: "01.04.2026", delayReason: null },
      { id: 8,  description: "Финальный расчёт",   docRef: "Счёт №73",  amount: 3_400_000, responsible: KP, planDate: "30.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 5, client: "Яндекс", projectCode: "YAN-4", direction: "Медиа",
    payments: [
      { id: 9,  description: "Оплата по договору", docRef: "Счёт №201", amount: 5_000_000, responsible: AS, planDate: "15.06.2026", factDate: null,         delayReason: null },
      { id: 10, description: "Доп. работы",        docRef: "Счёт №205", amount: 1_200_000, responsible: AS, planDate: "25.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 6, client: "Сбер", projectCode: "SBR-4", direction: "Инфлюенс",
    payments: [
      { id: 11, description: "Аванс",              docRef: "Счёт №312", amount: 7_500_000, responsible: PV, planDate: "10.05.2026", factDate: "10.05.2026", delayReason: null },
      { id: 12, description: "Финальная часть",    docRef: "Счёт №318", amount: 4_500_000, responsible: PV, planDate: "30.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 7, client: "Авито", projectCode: "AVI-4", direction: "Инфлюенс",
    payments: [
      { id: 13, description: "Оплата по счёту",    docRef: "Счёт №445", amount: 2_800_000, responsible: KP, planDate: "01.04.2026", factDate: "01.04.2026", delayReason: null },
    ],
  },
  {
    id: 8, client: "Медиа Плюс", projectCode: "MDP-1", direction: "Медиа",
    payments: [
      { id: 14, description: "Аванс 50%",          docRef: "Счёт №78",  amount: 1_600_000, responsible: AS, planDate: "20.05.2026", factDate: "20.05.2026", delayReason: null },
      { id: 15, description: "Постоплата 50%",     docRef: "Счёт №83",  amount: 1_600_000, responsible: AS, planDate: "20.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 9, client: "Форте", projectCode: "FRT-2", direction: "Контекст",
    payments: [
      { id: 16, description: "Платёж по акту",     docRef: "Счёт №156", amount: 3_200_000, responsible: PV, planDate: "22.06.2026", factDate: null,         delayReason: null },
      { id: 17, description: "Удержание",          docRef: "Счёт №160", amount:   800_000, responsible: PV, planDate: "25.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 10, client: "НовоТех", projectCode: "NVT-1", direction: "PR",
    payments: [
      { id: 18, description: "Полная оплата",      docRef: "Счёт №33",  amount: 2_200_000, responsible: KP, planDate: "28.03.2026", factDate: "28.03.2026", delayReason: null },
    ],
  },
  {
    id: 11, client: "Стройком", projectCode: "STK-5", direction: "Медиа",
    payments: [
      { id: 19, description: "Аванс",              docRef: "Счёт №521", amount: 4_000_000, responsible: AS, planDate: "15.05.2026", factDate: "15.05.2026", delayReason: null },
      { id: 20, description: "Финальный платёж",   docRef: "Счёт №528", amount: 2_500_000, responsible: AS, planDate: "15.07.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 12, client: "АгроЛайф", projectCode: "AGL-3", direction: "Контекст",
    payments: [
      { id: 21, description: "Платёж за март",     docRef: "Счёт №62",  amount: 1_100_000, responsible: PV, planDate: "25.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 13, client: "Диджитал Груп", projectCode: "DGP-2", direction: "Инфлюенс",
    payments: [
      { id: 22, description: "Аванс 50%",          docRef: "Счёт №711", amount: 6_000_000, responsible: KP, planDate: "25.06.2026", factDate: null,         delayReason: null },
      { id: 23, description: "Постоплата 50%",     docRef: "Счёт №714", amount: 6_000_000, responsible: KP, planDate: "05.07.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 14, client: "ЭкоСтрой", projectCode: "ECS-1", direction: "Медиа",
    payments: [
      { id: 24, description: "Полный расчёт",      docRef: "Счёт №29",  amount: 1_800_000, responsible: AS, planDate: "15.06.2026", factDate: null,         delayReason: null },
    ],
  },
];
