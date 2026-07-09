export type KanbanStageKey = "internal_approval" | "client_approval" | "sign_us" | "sign_client" | "signed";

export interface KanbanDocument {
  id: string;
  // legacy fields (kept for compatibility)
  type?: "Договор" | "Приложение" | "Счёт" | "УПД" | "Акт" | "СФ";
  number?: string;
  client?: string;
  projectCode?: string;
  stage: KanbanStageKey;
  daysInStage?: number;
  parentDocId?: string;
  parentDocType?: string;
  parentSigned?: boolean;
  hasRevisions?: boolean;
  kam?: string | { name?: string; initials?: string };
  menDO?: string | { name?: string; initials?: string };
  direction?: string;
  month?: string;

  // new fields for KanbanCard v3/v6
  docType?: "Договор" | "Приложение" | "Счёт" | "УПД" | "Акт" | "СФ";
  docNumber?: string;
  clientName?: string;
  daysInStatus?: number;
  isOverdue?: boolean;
  hasEdits?: boolean;
  linkedAppNumber?: number | null;
}

export const KANBAN_STAGES = [
  { key: "internal_approval" as const, title: "Внутр. согласование", description: "" },
  { key: "client_approval" as const, title: "Согл. с клиентом", description: "" },
  { key: "sign_us" as const, title: "Мы подписываем", description: "" },
  { key: "sign_client" as const, title: "Клиент подписывает", description: "" },
  { key: "signed" as const, title: "Подписан", description: "" },
];

export const kanbanMockDocuments: KanbanDocument[] = [
  // Внутр. согласование
  { id: '1', docType: 'УПД', docNumber: '45', clientName: 'Yandex', projectCode: 'YAN-1', stage: 'internal_approval', daysInStatus: 3, isOverdue: false, hasEdits: true, linkedAppNumber: 13 },
  { id: '2', docType: 'Акт', docNumber: '8', clientName: 'Сбер', projectCode: 'SBR-2', stage: 'internal_approval', daysInStatus: 1, isOverdue: false, hasEdits: false, linkedAppNumber: 27 },
  { id: '3', docType: 'УПД', docNumber: '60', clientName: 'РусТех', projectCode: 'RUS-1', stage: 'internal_approval', daysInStatus: 6, isOverdue: true, hasEdits: true, linkedAppNumber: 33 },

  // Согл. с клиентом
  { id: '4', docType: 'Договор', docNumber: '33', clientName: 'РусТех', projectCode: 'RUS-1', stage: 'client_approval', daysInStatus: 4, isOverdue: false, hasEdits: false },
  { id: '5', docType: 'УПД', docNumber: '52', clientName: 'Альфа Медиа', projectCode: 'ALF-3', stage: 'client_approval', daysInStatus: 6, isOverdue: true, hasEdits: false, linkedAppNumber: 88 },
  { id: '6', docType: 'Приложение', docNumber: '88', clientName: 'Альфа Медиа', projectCode: 'ALF-3', stage: 'client_approval', daysInStatus: 2, isOverdue: false, hasEdits: false },
  { id: '7', docType: 'Договор', docNumber: '77', clientName: 'Яндекс', projectCode: 'YAN-2', stage: 'client_approval', daysInStatus: 7, isOverdue: true, hasEdits: true },

  // Мы подписываем
  { id: '8', docType: 'Счёт', docNumber: '201', clientName: 'Yandex', projectCode: 'YAN-1', stage: 'sign_us', daysInStatus: 1, isOverdue: false, hasEdits: false, linkedAppNumber: 13 },
  { id: '9', docType: 'СФ', docNumber: '15', clientName: 'Авито', projectCode: 'AVI-1', stage: 'sign_us', daysInStatus: 8, isOverdue: true, hasEdits: false, linkedAppNumber: 41 },

  // Клиент подписывает
  { id: '10', docType: 'Приложение', docNumber: '13', clientName: 'Yandex', projectCode: 'YAN-1', stage: 'sign_client', daysInStatus: 2, isOverdue: false, hasEdits: false },
  { id: '11', docType: 'Приложение', docNumber: '27', clientName: 'Сбер', projectCode: 'SBR-2', stage: 'sign_client', daysInStatus: 7, isOverdue: true, hasEdits: false },

  // Подписан
  { id: '12', docType: 'Договор', docNumber: '12', clientName: 'Yandex', projectCode: 'YAN-1', stage: 'signed', daysInStatus: 0, isOverdue: false, hasEdits: false },
  { id: '13', docType: 'Приложение', docNumber: '41', clientName: 'Авито', projectCode: 'AVI-1', stage: 'signed', daysInStatus: 0, isOverdue: false, hasEdits: false },
];
