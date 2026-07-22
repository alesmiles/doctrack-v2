export type RoleId = 'kam' | 'lawyer' | 'producer' | 'director' | 'do_specialist';

export const ROLE_LABELS: Record<RoleId, string> = {
  kam: 'КАМ',
  lawyer: 'Юрист',
  producer: 'Продюсер',
  director: 'Директор',
  do_specialist: 'Специалист ДО',
};

export type Direction = 'clients' | 'contractors_clients' | 'contractors_internal';
export type BoardType = 'kanban' | 'table';

// Значения sidebarItems синхронизированы с реальными строками activePage,
// используемыми в src/App.tsx (renderPage) и src/components/Sidebar.tsx
// (onNavigate("clients") и т.д.) — а НЕ с буквальными строками
// contractors_clients/contractors_internal из текста ТЗ. Это сознательное
// отклонение от буквального текста ТЗ ради соответствия существующему коду,
// зафиксировать в IMPLEMENTATION_REPORT.md как допущение.
export type SidebarItemId = 'clients' | 'contractors-client' | 'contractors-internal' | 'estimates';

interface RoleConfig {
  sidebarItems: SidebarItemId[];
  boardType: { documents: BoardType; estimates: BoardType };
  canCreate: boolean;
  hasFullApprovalAccess: boolean;
}

export const ROLES: Record<RoleId, RoleConfig> = {
  kam: {
    sidebarItems: ['clients', 'contractors-client', 'estimates'],
    boardType: { documents: 'kanban', estimates: 'kanban' },
    canCreate: true,
    hasFullApprovalAccess: false,
  },
  producer: {
    sidebarItems: ['contractors-internal', 'estimates'],
    boardType: { documents: 'kanban', estimates: 'kanban' },
    canCreate: true,
    hasFullApprovalAccess: false,
  },
  lawyer: {
    sidebarItems: ['clients', 'contractors-client', 'contractors-internal'],
    boardType: { documents: 'table', estimates: 'table' },
    canCreate: false,
    hasFullApprovalAccess: false,
  },
  director: {
    sidebarItems: ['clients', 'contractors-client', 'contractors-internal', 'estimates'],
    boardType: { documents: 'kanban', estimates: 'kanban' },
    canCreate: true,
    hasFullApprovalAccess: true,
  },
  do_specialist: {
    sidebarItems: ['clients', 'contractors-client', 'contractors-internal', 'estimates'],
    boardType: { documents: 'kanban', estimates: 'kanban' },
    canCreate: true,
    hasFullApprovalAccess: false,
  },
};

export const ROLE_FOOTER_DEMO: Record<RoleId, { name: string; title: string }> = {
  kam: { name: 'Кирилл Петров', title: 'КАМ' },
  producer: { name: 'Дмитрий Соколов', title: 'Продюсер' },
  lawyer: { name: 'Алина Смирнова', title: 'Юрист' },
  director: { name: 'Александр Милевич', title: 'Директор' },
  do_specialist: { name: 'Ирина Романова', title: 'Специалист ДО' },
};
