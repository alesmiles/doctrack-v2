# saas-docflow-app — Claude Code Instructions
## Stack
- React 18 + TypeScript + Vite
- shadcn/ui (style: new-york, baseColor: neutral, cssVariables: true)
- Tailwind CSS
- No react-router — routing via activePage state in App.tsx
## Aliases
- @/components → src/components
- @/components/ui → src/components/ui
- @/lib → src/lib
- @/hooks → src/hooks

## Routing pattern
To add a new page:
1. Create src/pages/NewPage.tsx
2. Add case "page-key": return <NewPage /> to switch in App.tsx
3. Add nav item to Sidebar.tsx calling onNavigate("page-key")

## UI conventions
- Language: Russian throughout the UI
- All colors via CSS variables
- Use shadcn/ui components from @/components/ui
- Tailwind for layout and spacing
- text-gray-900 primary, text-gray-500 secondary, text-gray-400 muted
- border-gray-200 default, border-gray-300 hover
- Sidebar: 240px expanded, 56px collapsed
- Main content: flex-1 overflow-y-auto min-w-0

## Key reference file
docs/clients-reference.tsx — full UI reference for the Clients page. Read before building any list or table views.

## Sidebar navigation structure
ЗАЯВКИ: Заявка ДО / Создать проект / ДО в работе
ДОКУМЕНТООБОРОТ: Клиенты (clients) / Подрядчики (contractors-client, contractors-internal)
ПЛАТЕЖИ: Дебиторская задолженность (receivables) / На оплату
БАЗА: Клиенты / Подрядчики / Сотрудники
СИСТЕМА: Архив / Настройки
Footer: Инна Михрабова / МенДО

## Code style
- Functional components only
- Props interfaces defined above the component
- Use cn() from @/lib/utils for conditional classes
- Tailwind only, no inline styles
- Split components when over 150 lines
- Russian comments are fine

## Режим работы (обязательно для всех задач)

ЗАПРЕЩЕНО задавать уточняющие вопросы или останавливаться в ожидании ответа
в чате на любом этапе выполнения задачи. При неоднозначности — выбери
наиболее вероятную трактовку, реализуй, опиши допущение только в финальном
отчёте. Работай непрерывно до конца чек-листа без остановок на подтверждение
в чате. Исключение — системные диалоги macOS/терминала (разрешение на запись
файлов, bash-команды) — они не текстовые вопросы, на них запрет не действует.

## Definition of Done — стандарт оформления

Каждая задача завершается блоком Definition of Done, оформленным как
конкретные проверяемые пункты, а не общие описания:
- Каждый пункт — измеримое условие (конкретное значение, конкретное действие,
  конкретный результат), а не "выглядит хорошо" или "работает корректно".
- Для визуальных правок — указывать конкретные CSS-свойства/значения
  для проверки (цвет, px, position), а не словесное описание.
- Обязательна секция "Проверка через Playwright" с пошаговым сценарием:
  что сделать (скролл/клик/открыть меню), что заскриншотить, с чем сравнить.
- Если после 3 итераций правки не сходятся с DoD — остановиться и сообщить
  конкретно какой пункт не проходит и почему, а не продолжать бесконечно.
