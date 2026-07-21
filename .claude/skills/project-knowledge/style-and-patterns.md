# DocTrack v2 — код-стайл и UI-конвенции

## Code style
- Functional components only
- Props interfaces defined above the component
- Use cn() from @/lib/utils for conditional classes
- Tailwind only, no inline styles
- Split components when over 150 lines
- Russian comments are fine

## Язык и общие правила UI
- Language: Russian throughout the UI
- All colors via CSS variables
- Use shadcn/ui components from @/components/ui
- Tailwind for layout and spacing

## Цвета текста
- text-gray-900 — primary
- text-gray-500 — secondary
- text-gray-400 — muted

## Границы
- border-gray-200 — default
- border-gray-300 — hover

## Layout
- Sidebar: 240px expanded, 56px collapsed
- Main content: flex-1 overflow-y-auto min-w-0

## Единый источник данных: Kanban + Table
Kanban и Table view на одной странице должны использовать один и тот же
источник данных/фильтрации — не создавай отдельную логику фильтрации для
каждого view.

Прецедент: в v1 был баг с рассинхронизацией kanban-фильтров именно из-за
неунифицированного источника данных. Это правило появилось из реальной
ошибки — не нарушать при добавлении новых страниц с обоими view.

## Команды проверок
```bash
npm run lint        # eslint .
npm run typecheck   # tsc --noEmit -p tsconfig.app.json
npm run build        # tsc -b && vite build
npm run preview       # vite preview — просмотр собранного билда
```
Автотестов пока нет — появятся позже. Функциональная проверка сейчас —
через Playwright (MCP) по сценарию задачи.