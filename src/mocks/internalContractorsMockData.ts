import { ContractorProject } from "../types";

export type InternalContractorStageKey = "approval" | "signing" | "signed";

export interface InternalContractorKanbanDocument {
  id: string;
  docType: "Договор" | "Приложение" | "Счёт" | "УПД" | "Акт" | "СФ";
  docNumber: string;
  contractorName: string;
  direction?: string;
  responsibleName?: string;
  doManagerName?: string;
  stage: InternalContractorStageKey;
  daysInStatus: number;
  isOverdue?: boolean;
  hasEdits?: boolean;
  linkedAppNumber?: number | null;
}

export const INTERNAL_CONTRACTOR_KANBAN_STAGES = [
  { key: "approval" as const, title: "На согласовании", description: "" },
  { key: "signing" as const, title: "На подписании", description: "" },
  { key: "signed" as const, title: "Подписан", description: "" },
];

export const internalContractorKanbanDocuments: InternalContractorKanbanDocument[] = [
  // На согласовании
  { id: 'i1', docType: 'Договор', docNumber: '61', contractorName: 'ИП Петров С.И.', direction: 'IT', responsibleName: 'Максим Р.', doManagerName: 'Наталья К.', stage: 'approval', daysInStatus: 2, isOverdue: false, hasEdits: true },
  { id: 'i2', docType: 'УПД', docNumber: '77', contractorName: 'ООО КлинСервис', direction: 'Административный', responsibleName: 'Наталья К.', doManagerName: 'Максим Р.', stage: 'approval', daysInStatus: 6, isOverdue: true, hasEdits: false, linkedAppNumber: 5 },
  { id: 'i3', docType: 'Акт', docNumber: '19', contractorName: 'ИП Захарова Л.Д.', stage: 'approval', daysInStatus: 1, isOverdue: false, hasEdits: false },

  // На подписании
  { id: 'i4', docType: 'Приложение', docNumber: '5', contractorName: 'ООО КлинСервис', direction: 'Административный', responsibleName: 'Наталья К.', doManagerName: 'Максим Р.', stage: 'signing', daysInStatus: 2, isOverdue: false, hasEdits: false },
  { id: 'i5', docType: 'Счёт', docNumber: '412', contractorName: 'ООО ТехноРент', direction: 'IT', responsibleName: 'Наталья К.', doManagerName: 'Максим Р.', stage: 'signing', daysInStatus: 7, isOverdue: true, hasEdits: true },
  { id: 'i6', docType: 'Договор', docNumber: '88', contractorName: 'ИП Волкова Е.А.', direction: 'Маркетинг', responsibleName: 'Максим Р.', doManagerName: 'Наталья К.', stage: 'signing', daysInStatus: 4, isOverdue: false, hasEdits: false },
  { id: 'i7', docType: 'УПД', docNumber: '30', contractorName: 'ООО АудитПлюс', direction: 'Бухгалтерия', responsibleName: 'Наталья К.', doManagerName: 'Максим Р.', stage: 'signing', daysInStatus: 8, isOverdue: true, hasEdits: false, linkedAppNumber: 7 },

  // Подписан
  { id: 'i8', docType: 'Приложение', docNumber: '7', contractorName: 'ООО АудитПлюс', direction: 'Бухгалтерия', responsibleName: 'Наталья К.', doManagerName: 'Максим Р.', stage: 'signed', daysInStatus: 0, isOverdue: false, hasEdits: false },
  { id: 'i9', docType: 'СФ', docNumber: '9', contractorName: 'ИП Петров С.И.', direction: 'IT', responsibleName: 'Максим Р.', doManagerName: 'Наталья К.', stage: 'signed', daysInStatus: 0, isOverdue: false, hasEdits: false },
  { id: 'i10', docType: 'Акт', docNumber: '20', contractorName: 'ИП Захарова Л.Д.', stage: 'signed', daysInStatus: 0, isOverdue: false, hasEdits: false },
];

export const INTERNAL_CONTRACTORS: ContractorProject[] = [
  {
    id: 101,
    contractor: "ИП Петров С.И.",
    projectCode: "HOZ-1",
    month: "January",
    year: 2026,
    direction: "IT",
    responsible: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    doManager: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    progress: { done: 2, total: 3 },
    sum: 180000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Signed ORIG", sum: 180000, docNumber: "C-201", datePlan: "10.01.2026", dateFact: "09.01.2026", hasFile: true,  comment: "" },
      { id: 2, type: "Акт",     status: "Signed ORIG", sum: 180000, docNumber: "A-101", datePlan: "31.01.2026", dateFact: "30.01.2026", hasFile: false, comment: "" },
      { id: 3, type: "Счёт",    status: "Not Created", sum: null,   docNumber: null,    datePlan: "05.02.2026", dateFact: null,         hasFile: false, comment: "" },
    ],
  },
  {
    id: 102,
    contractor: "ООО КлинСервис",
    projectCode: "HOZ-2",
    month: "February",
    year: 2026,
    direction: "Административный",
    responsible: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    doManager: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    progress: { done: 3, total: 3 },
    sum: 95000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор",    status: "Signed ORIG", sum: 95000, docNumber: "C-202", datePlan: "01.02.2026", dateFact: "30.01.2026", hasFile: true,  comment: "" },
      { id: 2, type: "Счёт",       status: "Signed EDO",  sum: 95000, docNumber: "I-301", datePlan: "15.02.2026", dateFact: "14.02.2026", hasFile: false, comment: "" },
      { id: 3, type: "Приложение", status: "Signed ORIG", sum: 95000, docNumber: "A-102", datePlan: "28.02.2026", dateFact: "27.02.2026", hasFile: false, comment: "" },
    ],
  },
  {
    id: 103,
    contractor: "ИП Захарова Л.Д.",
    projectCode: "HOZ-3",
    month: "March",
    year: 2026,
    direction: "Маркетинг",
    responsible: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    doManager: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    progress: { done: 0, total: 2 },
    sum: 240000,
    isOverdue: true,
    documents: [
      { id: 1, type: "Договор", status: "Requested",   sum: 240000, docNumber: null, datePlan: "01.03.2026", dateFact: null, hasFile: false, comment: "", isOverdue: true, overdueDays: 103 },
      { id: 2, type: "Акт",     status: "Not Created", sum: null,   docNumber: null, datePlan: "31.03.2026", dateFact: null, hasFile: false, comment: "" },
    ],
  },
  {
    id: 104,
    contractor: "ООО ТехноРент",
    projectCode: "HOZ-4",
    month: "March",
    year: 2026,
    direction: "IT",
    responsible: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    doManager: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    progress: { done: 1, total: 4 },
    sum: 320000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Signed ORIG", sum: 320000, docNumber: "C-205", datePlan: "05.03.2026", dateFact: "04.03.2026", hasFile: true,  comment: "" },
      { id: 2, type: "Счёт",    status: "Received",    sum: 320000, docNumber: "I-412", datePlan: "20.03.2026", dateFact: null,         hasFile: false, comment: "Awaiting original" },
      { id: 3, type: "Акт",     status: "Not Created", sum: null,   docNumber: null,    datePlan: "31.03.2026", dateFact: null,         hasFile: false, comment: "" },
      { id: 4, type: "УПД",     status: "Not Created", sum: null,   docNumber: null,    datePlan: "05.04.2026", dateFact: null,         hasFile: false, comment: "" },
    ],
  },
  {
    id: 105,
    contractor: "ООО АудитПлюс",
    projectCode: "HOZ-5",
    month: "April",
    year: 2026,
    direction: "Бухгалтерия",
    responsible: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    doManager: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    progress: { done: 1, total: 3 },
    sum: 410000,
    isOverdue: true,
    documents: [
      { id: 1, type: "Договор",    status: "Signed ORIG", sum: 410000, docNumber: "C-230", datePlan: "10.04.2026", dateFact: "09.04.2026", hasFile: true,  comment: "" },
      { id: 2, type: "УПД",        status: "Requested",   sum: 410000, docNumber: null,    datePlan: "20.04.2026", dateFact: null,         hasFile: false, comment: "", isOverdue: true, overdueDays: 80 },
      { id: 3, type: "Приложение", status: "Not Created", sum: null,   docNumber: null,    datePlan: "25.04.2026", dateFact: null,         hasFile: false, comment: "" },
    ],
  },
  {
    id: 106,
    contractor: "ИП Волкова Е.А.",
    projectCode: "HOZ-6",
    month: "April",
    year: 2026,
    direction: "Маркетинг",
    responsible: { initials: "МР", name: "Максим Р.", color: "bg-slate-400" },
    doManager: { initials: "НК", name: "Наталья К.", color: "bg-stone-400" },
    progress: { done: 2, total: 2 },
    sum: 150000,
    isOverdue: false,
    documents: [
      { id: 1, type: "Договор", status: "Signed ORIG", sum: 150000, docNumber: "C-240", datePlan: "05.04.2026", dateFact: "03.04.2026", hasFile: true,  comment: "" },
      { id: 2, type: "Акт",     status: "Signed ORIG", sum: 150000, docNumber: "A-140", datePlan: "20.04.2026", dateFact: "18.04.2026", hasFile: false, comment: "" },
    ],
  },
];
