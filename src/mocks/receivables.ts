// KAMs consistent with the Clients section: Кирилл П. (KP), Алина С. (AS), Полина В. (PV)
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

const KP = { initials: "KP", name: "Кирилл П." };
const AS = { initials: "AS", name: "Алина С." };
const PV = { initials: "PV", name: "Полина В." };

// Exactly 3 projects with overdue payments (TODAY = 2026-06-12):
// ALF-8 (pay1, plan 27.05), GEO-1 (pay4, plan 01.06), BRZ-3 (pay5, plan 04.06)
export const RECEIVABLE_PROJECTS: ReceivableProject[] = [
  {
    id: 1, client: "Alpha Media", projectCode: "ALF-8", direction: "Influence",
    payments: [
      { id: 1,  description: "Advance 50%",           docRef: "Invoice №112", amount: 3_500_000, responsible: KP, planDate: "27.05.2026", factDate: null,         delayReason: "Approval delay" },
      { id: 2,  description: "Postpayment 50%",        docRef: "Invoice №115", amount: 4_000_000, responsible: KP, planDate: "20.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 2, client: "GeoTech", projectCode: "GEO-1", direction: "Context",
    payments: [
      { id: 3,  description: "Advance",                docRef: "Invoice №98",  amount: 2_400_000, responsible: AS, planDate: "25.04.2026", factDate: "25.04.2026", delayReason: null },
      { id: 4,  description: "Postpayment on act",     docRef: "Invoice №104", amount: 1_900_000, responsible: AS, planDate: "01.06.2026", factDate: null,         delayReason: "Awaiting closing documents" },
    ],
  },
  {
    id: 3, client: "Briz", projectCode: "BRZ-3", direction: "Media",
    payments: [
      { id: 5,  description: "Payment for services",   docRef: "Invoice №87",  amount: 2_100_000, responsible: PV, planDate: "04.06.2026", factDate: null,         delayReason: null },
      { id: 6,  description: "Guarantee payment",      docRef: "Invoice №91",  amount: 1_500_000, responsible: PV, planDate: "30.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 4, client: "RusTech", projectCode: "RST-2", direction: "PR",
    payments: [
      { id: 7,  description: "Advance 30%",            docRef: "Invoice №67",  amount: 1_800_000, responsible: KP, planDate: "01.04.2026", factDate: "01.04.2026", delayReason: null },
      { id: 8,  description: "Final payment",          docRef: "Invoice №73",  amount: 3_400_000, responsible: KP, planDate: "30.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 5, client: "Yandex", projectCode: "YAN-4", direction: "Media",
    payments: [
      { id: 9,  description: "Payment per contract",   docRef: "Invoice №201", amount: 5_000_000, responsible: AS, planDate: "15.06.2026", factDate: null,         delayReason: null },
      { id: 10, description: "Additional work",        docRef: "Invoice №205", amount: 1_200_000, responsible: AS, planDate: "25.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 6, client: "Sber", projectCode: "SBR-4", direction: "Influence",
    payments: [
      { id: 11, description: "Advance",                docRef: "Invoice №312", amount: 7_500_000, responsible: PV, planDate: "10.05.2026", factDate: "10.05.2026", delayReason: null },
      { id: 12, description: "Final installment",      docRef: "Invoice №318", amount: 4_500_000, responsible: PV, planDate: "30.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 7, client: "Avito", projectCode: "AVI-4", direction: "Influence",
    payments: [
      { id: 13, description: "Payment per invoice",    docRef: "Invoice №445", amount: 2_800_000, responsible: KP, planDate: "01.04.2026", factDate: "01.04.2026", delayReason: null },
    ],
  },
  {
    id: 8, client: "Media Plus", projectCode: "MDP-1", direction: "Media",
    payments: [
      { id: 14, description: "Advance 50%",            docRef: "Invoice №78",  amount: 1_600_000, responsible: AS, planDate: "20.05.2026", factDate: "20.05.2026", delayReason: null },
      { id: 15, description: "Postpayment 50%",        docRef: "Invoice №83",  amount: 1_600_000, responsible: AS, planDate: "20.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 9, client: "Forte", projectCode: "FRT-2", direction: "Context",
    payments: [
      { id: 16, description: "Payment per act",        docRef: "Invoice №156", amount: 3_200_000, responsible: PV, planDate: "22.06.2026", factDate: null,         delayReason: null },
      { id: 17, description: "Retention",              docRef: "Invoice №160", amount:   800_000, responsible: PV, planDate: "25.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 10, client: "NovoTech", projectCode: "NVT-1", direction: "PR",
    payments: [
      { id: 18, description: "Full payment",           docRef: "Invoice №33",  amount: 2_200_000, responsible: KP, planDate: "28.03.2026", factDate: "28.03.2026", delayReason: null },
    ],
  },
  {
    id: 11, client: "Stroykom", projectCode: "STK-5", direction: "Media",
    payments: [
      { id: 19, description: "Advance",                docRef: "Invoice №521", amount: 4_000_000, responsible: AS, planDate: "15.05.2026", factDate: "15.05.2026", delayReason: null },
      { id: 20, description: "Final payment",          docRef: "Invoice №528", amount: 2_500_000, responsible: AS, planDate: "15.07.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 12, client: "AgroLife", projectCode: "AGL-3", direction: "Context",
    payments: [
      { id: 21, description: "March payment",          docRef: "Invoice №62",  amount: 1_100_000, responsible: PV, planDate: "25.06.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 13, client: "Digital Group", projectCode: "DGP-2", direction: "Influence",
    payments: [
      { id: 22, description: "Advance 50%",            docRef: "Invoice №711", amount: 6_000_000, responsible: KP, planDate: "25.06.2026", factDate: null,         delayReason: null },
      { id: 23, description: "Postpayment 50%",        docRef: "Invoice №714", amount: 6_000_000, responsible: KP, planDate: "05.07.2026", factDate: null,         delayReason: null },
    ],
  },
  {
    id: 14, client: "EcoStroy", projectCode: "ECS-1", direction: "Media",
    payments: [
      { id: 24, description: "Full settlement",        docRef: "Invoice №29",  amount: 1_800_000, responsible: AS, planDate: "15.06.2026", factDate: null,         delayReason: null },
    ],
  },
];
