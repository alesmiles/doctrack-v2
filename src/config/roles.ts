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
// R1: 'employees' и 'on-signature' добавлены этой задачей — доступны только
// роли 'director' (см. таблицу видимости разделов, D5/D13/D14).
export type SidebarItemId = 'clients' | 'contractors-client' | 'contractors-internal' | 'estimates' | 'employees' | 'on-signature';

// Пункты dropdown «Создать» в сайдбаре, фильтруемые по роли.
export type CreateItemId = 'project' | 'estimate' | 'client-doc' | 'vendor-doc';

interface RoleConfig {
  sidebarItems: SidebarItemId[];
  createItems: CreateItemId[];
  boardType: { documents: BoardType; estimates: BoardType };
  canCreate: boolean;
  hasFullApprovalAccess: boolean;
}

export const ROLES: Record<RoleId, RoleConfig> = {
  kam: {
    sidebarItems: ['clients', 'contractors-client', 'estimates'],
    createItems: ['project', 'client-doc', 'vendor-doc', 'estimate'],
    boardType: { documents: 'kanban', estimates: 'kanban' },
    canCreate: true,
    hasFullApprovalAccess: false,
  },
  // R (доработка «структура Документооборот»): sidebarItems сменён с
  // 'contractors-client' на 'contractors-internal' — по таблице видимости
  // ТЗ у Продюсера подпункт «Подрядчики» = «Внутренние», а не «Проектные»
  // (было наоборот до этой доработки).
  producer: {
    sidebarItems: ['contractors-internal', 'estimates'],
    createItems: ['vendor-doc', 'estimate'],
    boardType: { documents: 'kanban', estimates: 'kanban' },
    canCreate: true,
    hasFullApprovalAccess: false,
  },
  lawyer: {
    sidebarItems: ['clients', 'contractors-client', 'contractors-internal'],
    createItems: ['client-doc', 'vendor-doc'],
    boardType: { documents: 'table', estimates: 'table' },
    canCreate: true,
    hasFullApprovalAccess: false,
  },
  director: {
    sidebarItems: ['clients', 'contractors-client', 'contractors-internal', 'estimates', 'on-signature', 'employees'],
    createItems: ['project', 'client-doc', 'vendor-doc', 'estimate'],
    boardType: { documents: 'kanban', estimates: 'kanban' },
    canCreate: true,
    hasFullApprovalAccess: true,
  },
  do_specialist: {
    sidebarItems: ['clients', 'contractors-client', 'contractors-internal'],
    createItems: ['client-doc', 'vendor-doc'],
    boardType: { documents: 'kanban', estimates: 'kanban' },
    canCreate: true,
    hasFullApprovalAccess: false,
  },
};

// R1/R2 (Блок 7 · На подписи): currentUser в App.tsx был захардкожен на "kam"
// независимо от переключателя роли в футере сайдбара — счётчик и видимость
// "На подписи" требуют, чтобы currentUser совпадал с currentRole. do_specialist
// не имеет отдельного демо-пользователя в DEMO_USERS — используем ближайший по
// смыслу (mendo, "Специалист ДО"/менеджер ДО), это допущение.
export const ROLE_DEMO_USER_ID: Record<RoleId, string> = {
  kam: 'user-kam',
  producer: 'user-producer',
  lawyer: 'user-lawyer',
  director: 'user-director',
  do_specialist: 'user-mendo',
};

export const ROLE_FOOTER_DEMO: Record<RoleId, { name: string; title: string }> = {
  kam: { name: 'Кирилл Петров', title: 'КАМ' },
  producer: { name: 'Дмитрий Соколов', title: 'Продюсер' },
  lawyer: { name: 'Алина Смирнова', title: 'Юрист' },
  director: { name: 'Александр Милевич', title: 'Директор' },
  do_specialist: { name: 'Ирина Романова', title: 'Специалист ДО' },
};
