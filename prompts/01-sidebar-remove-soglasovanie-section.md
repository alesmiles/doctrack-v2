## 1) Заголовок

Удалить дублирующий top-level раздел «Согласование» (аккордеон с пунктами «Сметы» / «Документы» / «На подписи») из `Sidebar.tsx` и снять маршрут на `SoglasovanieDocumentsPage` в `App.tsx`.

---

## 2) Контекст и что НЕ трогать

Репозиторий — doctrack-v2-local. Код-стайл и общие конвенции — в `.claude/skills/project-knowledge/style-and-patterns.md` и `.claude/skills/project-knowledge/product-and-code.md`.

Что уже реализовано и стабильно, проверено в коде на момент постановки задачи:

- `Sidebar` (`src/components/Sidebar.tsx:44`) рендерит аккордеон «Согласование»: кнопка-заголовок с текстом «Согласование» и шевроном (`src/components/Sidebar.tsx:145-157`), три дочерних пункта — «Сметы» → `onNavigate("soglasovanie-smety")` (`src/components/Sidebar.tsx:162-174`), «Документы» → `onNavigate("soglasovanie-documents")` (`src/components/Sidebar.tsx:177-189`), «На подписи · {signCount}» → `onNavigate("soglasovanie-na-podpisi")` (`src/components/Sidebar.tsx:192-204`). Весь блок обёрнут условием `showSoglasovanie` (`src/components/Sidebar.tsx:142-208`).
- Поддерживающий код этого блока: константа видимости по роли `SOGLASOVANIE_VISIBILITY` (`src/components/Sidebar.tsx:34-42`), производные `soglasovanieVisibility`, `showSoglasovanie`, `signCount` (`src/components/Sidebar.tsx:57-59`), `showSoglasovanieChildren` (`src/components/Sidebar.tsx:61`), состояние `isSoglasovanieOpen` (`src/components/Sidebar.tsx:46`), `prevActivePageRef` и синхронизирующий `useEffect` (`src/components/Sidebar.tsx:48`, `src/components/Sidebar.tsx:50-55`), импорт `SOGLASOVANIE_SEED` (`src/components/Sidebar.tsx:6`), импорт типа `UserRole` (`src/components/Sidebar.tsx:5`, используется только в `SOGLASOVANIE_VISIBILITY`), импорты иконок `ClipboardCheck`, `Calculator`, `FileSignature` (`src/components/Sidebar.tsx:2`, используются только внутри удаляемого блока).
- `src/App.tsx` импортирует `SoglasovanieDocumentsPage` (`src/App.tsx:8`) и рендерит её в `renderPage()` при `activePage === "soglasovanie-documents"` (`src/App.tsx:60-61`). Для `activePage === "soglasovanie-smety"` и `activePage === "soglasovanie-na-podpisi"` отдельного `case` нет — оба уже попадают в `default` (`src/App.tsx:83-88`, заглушка «Section in development»); это поведение не меняется этой задачей.
- Согласование документов с клиентами и подрядчиками уже реализовано как отдельные страницы, доступные через другие кнопки сайдбара: «Клиенты» → `ClientsPage` (`activePage === "clients"`, `src/App.tsx:58-59`), «Подрядчики · Клиенты» → `ContractorsPage` (`activePage === "contractors-client"`, `src/App.tsx:62-63`), «Подрядчики · Внутренние» → `InternalContractorsPage` (`activePage === "contractors-internal"`, `src/App.tsx:64-65`). Именно из-за них аккордеон «Согласование» является дублирующим.
- Переключатель роли, влияющий на `currentUser.role` (используется в `SOGLASOVANIE_VISIBILITY`), — выпадающий список «Роль:» в `AppHeader` (`src/components/AppHeader.tsx:21-33`). Это отдельный механизм от переключателя роли в футере сайдбара (`ROLE_MENU_ORDER`, `src/components/Sidebar.tsx:23`), который на видимость раздела «Согласование» не влияет.

НЕ ТРОГАТЬ (файлы поимённо, изменять и удалять нельзя):

- `src/pages/SoglasovanieDocumentsPage.tsx` — после задачи не используется из `App.tsx`, но файл не удаляется (удаление файлов требует отдельного согласования по корневому `CLAUDE.md`).
- `src/data/soglasovanie-seed.ts` — используется также в `src/components/SoglasovanieKanbanBoard.tsx`, `src/components/SoglasovanieKanbanCard.tsx`, `src/components/SoglasovanieKanbanStageGroup.tsx`.
- `src/components/SoglasovanieKanbanBoard.tsx`, `src/components/SoglasovanieKanbanCard.tsx`, `src/components/SoglasovanieKanbanStageGroup.tsx`.
- `src/components/KanbanBoard.tsx`, `src/components/ContractorKanbanBoard.tsx`, `src/components/InternalContractorKanbanBoard.tsx` и их дочерние `*KanbanCard.tsx` / `*KanbanStageGroup.tsx` — используются страницами `ClientsPage`, `ContractorsPage`, `InternalContractorsPage`.
- `src/pages/ClientsPage.tsx`, `src/pages/ContractorsPage.tsx`, `src/pages/InternalContractorsPage.tsx`.
- `src/config/roles.ts`, `src/types/index.ts`, `src/constants/index.ts`.
- Остальные `case` в `renderPage()` (`src/App.tsx:56-90`) и остальные секции/кнопки `Sidebar` (`src/components/Sidebar.tsx:62-93`, `src/components/Sidebar.tsx:210-320`).

В кодовой базе нет отдельного маршрута или компонента с названием «Согласование», кроме описанного выше аккордеона в `Sidebar.tsx` и кейса `soglasovanie-documents` в `App.tsx` — других мест с этим названием, которые можно перепутать, не существует.

---

## 3) Описание задачи

**R1.** В `src/components/Sidebar.tsx` полностью удалены: JSX-блок аккордеона «Согласование» (`src/components/Sidebar.tsx:142-208`, включая кнопку-заголовок и три дочерних пункта), константа `SOGLASOVANIE_VISIBILITY` вместе с предшествующим ей комментарием (`src/components/Sidebar.tsx:34-42`), переменные `soglasovanieVisibility`, `showSoglasovanie`, `signCount`, `showSoglasovanieChildren`, состояние `isSoglasovanieOpen`, `prevActivePageRef` и связанный `useEffect`, импорт `SOGLASOVANIE_SEED`, а также ставшие неиспользуемыми импорты `ClipboardCheck`, `Calculator`, `FileSignature`, `UserRole`.

**R2.** В `src/App.tsx` удалены импорт `SoglasovanieDocumentsPage` (`src/App.tsx:8`) и `case "soglasovanie-documents"` в `renderPage()` (`src/App.tsx:60-61`).

**R3.** Кнопки сайдбара «Клиенты» (секция «ДОКУМЕНТООБОРОТ», `activePage === "clients"`), «Подрядчики · Клиенты» (`activePage === "contractors-client"`) и «Подрядчики · Внутренние» (`activePage === "contractors-internal"`) после изменения по-прежнему рендерят страницы `ClientsPage`, `ContractorsPage`, `InternalContractorsPage` соответственно.

**R4.** Файлы из списка «НЕ ТРОГАТЬ» раздела 2 не изменены и не удалены.

**R5.** После реализации каждое из требований R1–R4 построчно сопоставлено с итоговым кодом; результат зафиксирован в едином файле-отчёте `IMPLEMENTATION_REPORT.md`, дополняемом в разделе 6.

---

## 3a) Трассировка требований (R → D)

R1 → D1, D2, D4, D5, D6, D10, D11, D12
R2 → D3, D10, D11, D12
R3 → D7, D8, D9
R4 → D13
R5 → зафиксировано в разделе 6 (таблица в `IMPLEMENTATION_REPORT.md`)

---

## 4) Definition of Done

**D1.** Команда `grep -c "Согласование" src/components/Sidebar.tsx` возвращает `0`.

**D2.** Команда `grep -Ec "soglasovanie-smety|soglasovanie-na-podpisi|soglasovanie-documents" src/components/Sidebar.tsx` возвращает `0`.

**D3.** Команда `grep -c "SoglasovanieDocumentsPage" src/App.tsx` возвращает `0`.

**D4.** Команда `grep -Ec "ClipboardCheck|Calculator|FileSignature|SOGLASOVANIE_VISIBILITY|isSoglasovanieOpen|SOGLASOVANIE_SEED|UserRole" src/components/Sidebar.tsx` возвращает `0`.

**D5.** При старте приложения без дополнительных действий пользователя (значение `currentUser.role` из `DEMO_USERS` равно `"kam"`, `activePage` равен `"clients"`) DOM-снапшот `<aside>` (сайдбар) не содержит ни одного узла с текстом «Согласование».

**D6.** После выбора пункта «Директор» в выпадающем списке «Роль:» в `AppHeader` DOM-снапшот `<aside>` по-прежнему не содержит ни одного узла с текстом «Согласование».

**D7.** По клику на кнопку сайдбара с текстом «Клиенты» в блоке под заголовком «ДОКУМЕНТООБОРОТ» (первая кнопка с таким текстом сверху вниз в DOM-дереве сайдбара) в области `<main>` появляется контент, отличный от текста-заглушки «Section in development».

**D8.** По клику на кнопку сайдбара с текстом «Подрядчики · Клиенты» в области `<main>` появляется контент, отличный от текста-заглушки «Section in development».

**D9.** По клику на кнопку сайдбара с текстом «Подрядчики · Внутренние» в области `<main>` появляется контент, отличный от текста-заглушки «Section in development».

**D10.** Команда `npm run lint` завершается с кодом выхода `0`.

**D11.** Команда `npm run typecheck` завершается с кодом выхода `0`.

**D12.** Команда `npm run build` завершается с кодом выхода `0`.

**D13.** Команда `git diff --name-only` перечисляет только файлы `src/components/Sidebar.tsx`, `src/App.tsx` и `IMPLEMENTATION_REPORT.md`.

---

## 5) Проверка через Playwright (MCP, реальная браузерная сессия)

Шаги 0.1–0.4 не требуют браузера, выполняются в терминале в корне репозитория.

0.1. Выполнить `grep -c "Согласование" src/components/Sidebar.tsx`, зафиксировать вывод. [проверяет: D1]
0.2. Выполнить `grep -Ec "soglasovanie-smety|soglasovanie-na-podpisi|soglasovanie-documents" src/components/Sidebar.tsx`, зафиксировать вывод. [проверяет: D2]
0.3. Выполнить `grep -c "SoglasovanieDocumentsPage" src/App.tsx`, зафиксировать вывод. [проверяет: D3]
0.4. Выполнить `grep -Ec "ClipboardCheck|Calculator|FileSignature|SOGLASOVANIE_VISIBILITY|isSoglasovanieOpen|SOGLASOVANIE_SEED|UserRole" src/components/Sidebar.tsx`, зафиксировать вывод. [проверяет: D4]
0.5. Выполнить `npm run lint`, зафиксировать код выхода. [проверяет: D10]
0.6. Выполнить `npm run typecheck`, зафиксировать код выхода. [проверяет: D11]
0.7. Выполнить `npm run build`, зафиксировать код выхода. [проверяет: D12]
0.8. Выполнить `git diff --name-only`, зафиксировать список файлов. [проверяет: D13]

Далее — браузерные шаги через Playwright MCP.

1. Запустить `npm run dev`, открыть `http://localhost:5173`.
2. Сделать снапшот страницы. Найти в снапшоте `<aside>` и убедиться, что среди его дочерних узлов нет узла с текстом «Согласование». [проверяет: D5]
3. Кликнуть по кнопке «Роль: …» в правом верхнем углу (`AppHeader`), в открывшемся списке кликнуть пункт «Директор». Сделать снапшот `<aside>`, убедиться, что узла с текстом «Согласование» по-прежнему нет. [проверяет: D6]
4. В снапшоте `<aside>` найти первую сверху вниз кнопку с текстом «Клиенты» и кликнуть по ней. Сделать снапшот области `<main>`, убедиться, что в ней нет текста «Section in development». [проверяет: D7]
5. Кликнуть по кнопке «Подрядчики · Клиенты». Сделать снапшот области `<main>`, убедиться, что в ней нет текста «Section in development». [проверяет: D8]
6. Кликнуть по кнопке «Подрядчики · Внутренние». Сделать снапшот области `<main>`, убедиться, что в ней нет текста «Section in development». [проверяет: D9]
7. Прочитать консоль браузера за шаги 2–6 (`browser_console_messages` или аналог используемого MCP-клиента) и убедиться, что сообщений уровня error — 0.

---

## 6) Финальная сверка с ТЗ

Отдельный проход после прохождения раздела 4 — построчная сверка с разделом 3, не повтор раздела 5.

1. Пройти R1…R5 по коду буквально, не по памяти о процессе реализации.
2. Сверить `git diff` с разделом 2 — изменения не вышли за пределы `src/components/Sidebar.tsx` и `src/App.tsx` (плюс `IMPLEMENTATION_REPORT.md`).

**Каскад:** если формулировка раздела 3 скорректирована в ходе сверки — заново пройти 3a для этого R-id, соответствующие D-id, соответствующие шаги раздела 5.

Обновление `IMPLEMENTATION_REPORT.md`:

| R-id | Статус | Где в коде | Комментарий |
|---|---|---|---|

**Протокол расхождений:**
1. Критическое (нарушает DoD/меняет поведение из раздела 3) — исправить сразу.
2. Некритическое — зафиксировать как «реализовано с отклонением», не округлять до «реализовано».
3. Лимит: не более 3 попыток на один пункт DoD за весь цикл (раздел 5 + 6). После 3 — «заблокировано», с описанием, что не выходит.

**Финальный статус:** Готово / Готово с отклонениями / Заблокировано — без промежуточных формулировок.

---

## 7) Режим работы

ЗАПРЕЩЕНО задавать уточняющие вопросы или останавливаться в ожидании ответа в чате
на любом этапе выполнения задачи. При неоднозначности — выбери наиболее вероятную
трактовку, реализуй, опиши допущение только в финальном отчёте. Работай непрерывно
до конца чек-листа без остановок на подтверждение в чате. Исключение — системные
диалоги macOS/терминала (разрешение на запись файлов, bash-команды) — они не текстовые
вопросы, на них запрет не действует.

---

## Что НЕ включать

- Не удалять и не архивировать `src/pages/SoglasovanieDocumentsPage.tsx` и `src/data/soglasovanie-seed.ts` — они остаются в репозитории неиспользуемыми из `App.tsx`, удаление файлов в эту задачу не входит.
- Не переносить `SoglasovanieKanbanBoard`, `SoglasovanieKanbanCard`, `SoglasovanieKanbanStageGroup` на другие страницы и не создавать для них новый маршрут.
- Не трогать объект `sections[0]` (заголовок «ДОКУМЕНТООБОРОТ», `src/components/Sidebar.tsx:62-69`) — он не рендерится через `sections.slice(1).map` (`src/components/Sidebar.tsx:257`) уже до этой задачи и с разделом «Согласование» не связан; его уборка не входит в эту задачу.
- Не менять `src/config/roles.ts`, `src/types/index.ts`, `src/constants/index.ts`.
- Не добавлять авто-тесты — их в проекте пока нет.
