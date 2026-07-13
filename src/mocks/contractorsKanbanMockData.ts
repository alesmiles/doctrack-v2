export type ContractorKanbanStageKey = "approval" | "signing" | "signed";

export interface ContractorKanbanDocument {
  id: string;
  docType: "Договор" | "Приложение" | "Счёт" | "УПД" | "Акт" | "СФ";
  docNumber: string;
  contractorName: string;
  clientName?: string;
  projectCode: string;
  direction?: string;
  responsibleName?: string;
  doManagerName?: string;
  stage: ContractorKanbanStageKey;
  daysInStatus: number;
  isOverdue?: boolean;
  hasEdits?: boolean;
  linkedAppNumber?: number | null;
}

export const CONTRACTOR_KANBAN_STAGES = [
  { key: "approval" as const, title: "На согласовании", description: "" },
  { key: "signing" as const, title: "На подписании", description: "" },
  { key: "signed" as const, title: "Подписан", description: "" },
];

export const contractorKanbanDocuments: ContractorKanbanDocument[] = [
  // На согласовании
  { id: 'c1', docType: 'Договор', docNumber: '14', contractorName: 'ИП Смирнов А.В.', clientName: 'Яндекс', projectCode: 'YAN-1', direction: 'Media', responsibleName: 'Кирилл В.', doManagerName: 'Инна М.', stage: 'approval', daysInStatus: 3, isOverdue: false, hasEdits: true },
  { id: 'c2', docType: 'УПД', docNumber: '22', contractorName: 'ООО МедиаСервис', clientName: 'Сбер', projectCode: 'SBR-1', direction: 'TV', responsibleName: 'Алина С.', doManagerName: 'Полина В.', stage: 'approval', daysInStatus: 6, isOverdue: true, hasEdits: false, linkedAppNumber: 9 },
  { id: 'c3', docType: 'Акт', docNumber: '31', contractorName: 'ООО Диджитал Про', projectCode: 'HOZ-1', direction: 'Media', responsibleName: 'Кирилл П.', doManagerName: 'Полина В.', stage: 'approval', daysInStatus: 1, isOverdue: false, hasEdits: false },

  // На подписании
  { id: 'c4', docType: 'Приложение', docNumber: '9', contractorName: 'ООО МедиаСервис', clientName: 'Сбер', projectCode: 'SBR-1', direction: 'TV', responsibleName: 'Алина С.', doManagerName: 'Полина В.', stage: 'signing', daysInStatus: 2, isOverdue: false, hasEdits: false },
  { id: 'c5', docType: 'Счёт', docNumber: '205', contractorName: 'ИП Горелова Т.С.', clientName: 'Авито', projectCode: 'AVI-2', direction: 'Influence', responsibleName: 'Кирилл П.', doManagerName: 'Инна М.', stage: 'signing', daysInStatus: 7, isOverdue: true, hasEdits: true },
  { id: 'c6', docType: 'Договор', docNumber: '40', contractorName: 'ООО Контент Лаб', clientName: 'РусТех', projectCode: 'RUS-2', direction: 'Content', responsibleName: 'Алина С.', doManagerName: 'Полина В.', stage: 'signing', daysInStatus: 4, isOverdue: false, hasEdits: false },
  { id: 'c7', docType: 'УПД', docNumber: '18', contractorName: 'ИП Рябов Д.О.', clientName: 'Альфа Медиа', projectCode: 'ALF-1', direction: 'Context', responsibleName: 'Алина С.', doManagerName: 'Инна М.', stage: 'signing', daysInStatus: 8, isOverdue: true, hasEdits: false, linkedAppNumber: 3 },

  // Подписан
  { id: 'c8', docType: 'Приложение', docNumber: '3', contractorName: 'ИП Рябов Д.О.', clientName: 'Альфа Медиа', projectCode: 'ALF-1', direction: 'Context', responsibleName: 'Алина С.', doManagerName: 'Инна М.', stage: 'signed', daysInStatus: 0, isOverdue: false, hasEdits: false },
  { id: 'c9', docType: 'СФ', docNumber: '5', contractorName: 'ИП Смирнов А.В.', clientName: 'Яндекс', projectCode: 'YAN-1', direction: 'Media', responsibleName: 'Кирилл В.', doManagerName: 'Инна М.', stage: 'signed', daysInStatus: 0, isOverdue: false, hasEdits: false },
  { id: 'c10', docType: 'Акт', docNumber: '12', contractorName: 'ООО Диджитал Про', projectCode: 'HOZ-1', direction: 'Media', responsibleName: 'Кирилл П.', doManagerName: 'Полина В.', stage: 'signed', daysInStatus: 0, isOverdue: false, hasEdits: false },
];
