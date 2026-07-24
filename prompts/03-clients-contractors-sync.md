## 1) Заголовок

Синхронизация справочников клиентов и подрядчиков: добавить в BASE_CLIENTS
и BASE_CONTRACTORS компании из канбан-данных, создать утилиты-хелперы,
заменить захардкоженные дропдауны в модальных окнах на данные из этих утилит.

## 2a) Глобальные инварианты (не редактируется, вставляется как есть)

Действуют правила project-knowledge, не переопределяются этой задачей:
- Design tokens и CSS-переменные не меняются.
- Sidebar: 240px развёрнутый / 56px свёрнутый — не меняется.
- Роутинг через `activePage` в `App.tsx` — react-router не добавляется.
- Примитивы `src/components/ui` (shadcn) не редактируются напрямую —
  расширение только через `src/components/base`.
- Если на странице есть Kanban и Table — один источник данных/фильтрации
  на оба view, раздельная логика не создаётся.
- Aliases (`@/components`, `@/components/ui`, `@/lib`, `@/hooks`) не
  меняются.

## 2b) Локальная зона — файлы этой задачи не трогают

- `src/mocks/kanbanMockData.ts` — использует clientName как строку, не
  мигрирует в этой фазе; данные карточек (Yandex, РусТех и т.д.) — не трогать.
- `src/mocks/contractorsKanbanMockData.ts` — аналогично, clientName/
  contractorName как строки; не трогать.
- `src/mocks/internalContractorsMockData.ts` — хозяйственные подрядчики
  (ООО КлинСервис, ИП Петров и т.д.); это отдельная сущность, не трогать.
- `src/mocks/projects.ts` — исторические ключи клиентов на английском
  (Yandex, Sber); не трогать в этой фазе.
- `src/mocks/estimatesMockData.ts` — не трогать.
- `src/mocks/receivables.ts`, `src/mocks/receivables-dynamics.ts` — не трогать.
- `src/utils/employees.ts` — не трогать.
- `src/pages/base/ClientsPage.tsx` — импортирует BASE_CLIENTS напрямую;
  визуально страница не изменится (новые записи появятся в таблице — это ожидаемо).
- `src/pages/base/ContractorsPage.tsx` — импортирует BASE_CONTRACTORS напрямую;
  визуально страница не изменится (новые записи появятся в таблице — это ожидаемо).
- `src/App.tsx` — импортирует все три модалки; не редактируется.
- `src/components/base/types.ts` — CompanyRecord тип; не трогать.
- `src/config/roles.ts` — содержит имена-строки; не трогать.

## 3) Описание задачи

**R1.** Добавить в `src/mocks/baseClients.ts` (в массив BASE_CLIENTS, после
  cl-5 «Тинькофф») две новые записи CompanyRecord:
  - id `"cl-6"`, company `"РусТех"`, status `"Активный"`, остальные поля —
    минимальные (legalEntities: [], edoSystem: "", serviceDirection: "",
    legalAddress: "", inn: "", kpp: "", ogrn: "", bankAccount: "", bik: "",
    bankName: "", responsiblePeople: []).
  - id `"cl-7"`, company `"Альфа Медиа"`, status `"Активный"`, все остальные
    поля — те же пустые строки что у cl-6: legalEntities: [], edoSystem: "",
    serviceDirection: "", legalAddress: "", inn: "", kpp: "", ogrn: "",
    bankAccount: "", bik: "", bankName: "", responsiblePeople: [].
  Существующие cl-1..cl-5 не трогать.

**R2.** Добавить в `src/mocks/baseContractors.ts` (в массив BASE_CONTRACTORS,
  после co-4 «АдТех Solutions») шесть новых записей CompanyRecord. Поля
  — минимальные (как в R1), статус `"Активный"`:
  - id `"co-5"`, company `"ИП Смирнов А.В."`
  - id `"co-6"`, company `"ООО МедиаСервис"`
  - id `"co-7"`, company `"ООО Диджитал Про"`
  - id `"co-8"`, company `"ИП Горелова Т.С."`
  - id `"co-9"`, company `"ООО Контент Лаб"`
  - id `"co-10"`, company `"ИП Рябов Д.О."`
  Структура каждой новой записи идентична co-4 по набору полей, но с
  legalEntities: [], edoSystem: "", serviceDirection: "", legalAddress: "",
  inn: "", kpp: "", ogrn: "", bankAccount: "", bik: "", bankName: "",
  responsiblePeople: [].
  Существующие co-1..co-4 не трогать.

**R3.** Создать файл `src/utils/clients.ts`:
```typescript
import { BASE_CLIENTS } from "@/mocks/baseClients";
import type { CompanyRecord } from "@/components/base/types";

export function getAllClients(): CompanyRecord[] {
  return BASE_CLIENTS;
}
export function getClientById(id: string): CompanyRecord | undefined {
  return BASE_CLIENTS.find((c) => c.id === id);
}
export function getClientByName(name: string): CompanyRecord | undefined {
  return BASE_CLIENTS.find((c) => c.company === name);
}
export function getActiveClients(): CompanyRecord[] {
  return BASE_CLIENTS.filter((c) => c.status === "Активный");
}
export const CLIENT_NAMES = BASE_CLIENTS.map((c) => c.company);
```

**R4.** Создать файл `src/utils/contractors.ts`:
```typescript
import { BASE_CONTRACTORS } from "@/mocks/baseContractors";
import type { CompanyRecord } from "@/components/base/types";

export function getAllContractors(): CompanyRecord[] {
  return BASE_CONTRACTORS;
}
export function getContractorById(id: string): CompanyRecord | undefined {
  return BASE_CONTRACTORS.find((c) => c.id === id);
}
export function getContractorByName(name: string): CompanyRecord | undefined {
  return BASE_CONTRACTORS.find((c) => c.company === name);
}
export function getActiveContractors(): CompanyRecord[] {
  return BASE_CONTRACTORS.filter((c) => c.status === "Активный");
}
export const CONTRACTOR_NAMES = BASE_CONTRACTORS.map((c) => c.company);
```

**R5.** В `src/components/CreateClientDocModal.tsx` (строка 34):
  - Убрать `const CLIENTS = [...]` и `const PROJECTS: Record<string, string[]> = {...}`.
  - Добавить импорт: `import { CLIENT_NAMES } from "@/utils/clients"`.
  - В JSX поле «Клиент» (строка 172): заменить `CLIENTS.map(...)` на
    `CLIENT_NAMES.map(...)`.
  - Поле «Проект» (строка 192): заменить `<Select>` с `PROJECTS[client]` на
    `<Input>` с placeholder="Введите код проекта" и тем же state-полем
    `project` / `setProject`.

**R6.** В `src/components/CreateProjectModal.tsx` (строка 15–37):
  - Убрать `const CLIENTS`, `const EXISTING_COUNTS`, `const CLIENT_PREFIX_MAP`
    и функцию `generateCode`.
  - Добавить импорт: `import { CLIENT_NAMES } from "@/utils/clients"`.
  - В JSX поле «Клиент»: заменить `CLIENTS.map(...)` на `CLIENT_NAMES.map(...)`.
  - Новая функция генерации кода: `(client: string) => client.slice(0, 3).toUpperCase() + "-1"`.
    Вызвать её в useEffect/onChange при выборе клиента, записать в state
    `projectCode`. Имя state-переменной не менять если она уже есть.

**R7.** В `src/components/CreateVendorDocModal.tsx` (строка 16):
  - Убрать `const VENDORS = [...]`.
  - Добавить импорт: `import { CONTRACTOR_NAMES } from "@/utils/contractors"`.
  - В JSX поле «Подрядчик»: заменить `VENDORS.map(...)` на
    `CONTRACTOR_NAMES.map(...)`.

**R8.** Выполнить grep и проверить (не модифицировать без нужды):
```bash
grep -r "Alpha Media\|Tutu.ru\|SberMarket\|Blogger Agency\|MediaBuy\|Print Studio" \
  src/ --include="*.tsx" --include="*.ts" -l
```
  Файлы `receivables.ts` и `receivables-dynamics.ts` в этот список не входят
  в доработку — они в 2b. Если grep найдёт файлы СВЕРХ тех что перечислены в
  R5/R6/R7 — включить их в миграцию по той же схеме.

## 3a) Трассировка R → D

- R1 → D1, D2, D15, D16
- R2 → D3
- R3 → D4
- R4 → D5
- R5 → D6, D7, D8
- R6 → D9, D10, D11
- R7 → D12, D13
- R8 → D14

## 4) Definition of Done

**D1.** В `src/mocks/baseClients.ts` существует запись с id `"cl-6"` и
  company `"РусТех"`. (R1)

**D2.** В `src/mocks/baseClients.ts` существует запись с id `"cl-7"` и
  company `"Альфа Медиа"`. (R1)

**D3.** В `src/mocks/baseContractors.ts` существуют записи с id `"co-5"`..
  `"co-10"` с company-именами: ИП Смирнов А.В., ООО МедиаСервис, ООО
  Диджитал Про, ИП Горелова Т.С., ООО Контент Лаб, ИП Рябов Д.О. (R2)

**D4.** Файл `src/utils/clients.ts` существует и экспортирует: `getAllClients`,
  `getClientById`, `getClientByName`, `getActiveClients`, `CLIENT_NAMES`. (R3)

**D5.** Файл `src/utils/contractors.ts` существует и экспортирует:
  `getAllContractors`, `getContractorById`, `getContractorByName`,
  `getActiveContractors`, `CONTRACTOR_NAMES`. (R4)

**D6.** В `src/components/CreateClientDocModal.tsx` нет строки `const CLIENTS`.
  (R5)

**D7.** В `src/components/CreateClientDocModal.tsx` нет строк "Alpha Media",
  "Tutu.ru", "SberMarket", "Yandex" в виде захардкоженных значений массива.
  (R5)

**D8.** В `src/components/CreateClientDocModal.tsx` поле «Проект» — это
  `<Input>`, не `<Select>` с PROJECTS-маппингом. (R5)

**D9.** В `src/components/CreateProjectModal.tsx` нет строки `const CLIENTS`.
  (R6)

**D10.** В `src/components/CreateProjectModal.tsx` нет строк "Alpha Media",
  "Tutu.ru", "SberMarket", "Yandex" в виде захардкоженных значений. (R6)

**D11.** В `src/components/CreateProjectModal.tsx` логика генерации кода
  проекта использует `client.slice(0, 3).toUpperCase()` и суффикс `-1`.
  (R6)

**D12.** В `src/components/CreateVendorDocModal.tsx` нет строки `const VENDORS`.
  (R7)

**D13.** В `src/components/CreateVendorDocModal.tsx` нет строк "Blogger Agency",
  "MediaBuy LLC", "Print Studio". (R7)

**D14.** grep по src/ на "Alpha Media|Tutu.ru|SberMarket|Blogger Agency|
  MediaBuy|Print Studio" не находит ни одного файла, кроме (опционально)
  receivables.ts / receivables-dynamics.ts (они в 2b). (R8)

**D15.** `npm run build` завершается без ошибок TypeScript. (R3)

**D16.** `git diff --stat` затрагивает только файлы из перечня ниже и ничего другого. (R4)
  - src/mocks/baseClients.ts
  - src/mocks/baseContractors.ts
  - src/utils/clients.ts (новый)
  - src/utils/contractors.ts (новый)
  - src/components/CreateClientDocModal.tsx
  - src/components/CreateProjectModal.tsx
  - src/components/CreateVendorDocModal.tsx
  Плюс опционально файлы найденные grep в R8, если такие есть. (все R)

## 5) Проверка через Playwright (MCP, реальный браузер)

Запустить `npm run dev` если сервер не запущен. URL: http://localhost:5173.

1. Bash: выполнить `cat src/utils/clients.ts` — убедиться что файл существует
   и содержит экспорты getAllClients, CLIENT_NAMES. [проверяет: D4]

2. Bash: выполнить `cat src/utils/contractors.ts` — убедиться что файл существует
   и содержит экспорты getAllContractors, CONTRACTOR_NAMES. [проверяет: D5]

3. Bash: выполнить `npm run build` — ожидать 0 ошибок TypeScript. [проверяет: D15]

4. Bash: выполнить `grep -r "Alpha Media\|Tutu.ru\|SberMarket\|Blogger Agency\|MediaBuy\|Print Studio" src/ --include="*.tsx" --include="*.ts" -l` — ожидать пустой вывод или только receivables.ts / receivables-dynamics.ts. [проверяет: D14]

5. Открыть http://localhost:5173. Кликнуть «Создать» → «Проект» в сайдбаре.
   В открывшемся модальном окне кликнуть дропдаун «Клиент». Скриншот.
   Убедиться что список содержит 7 значений: Яндекс, Сбер, Авито,
   Альфа-Банк ТГ, Тинькофф, РусТех, Альфа Медиа.
   [проверяет: D1] [проверяет: D2] [проверяет: D9] [проверяет: D10]

6. В том же модальном окне выбрать «Яндекс» из дропдауна. Скриншот поля
   «Код проекта». Убедиться что значение поля — «ЯНД-1». [проверяет: D11]

7. Закрыть. Кликнуть «Создать» → «Документ клиента». В открывшемся модальном
   кликнуть дропдаун «Клиент». Скриншот. Убедиться что те же 7 значений.
   [проверяет: D6] [проверяет: D7]

8. В том же модальном убедиться что поле «Проект» — это текстовый Input
   (не Select без вариантов). Скриншот поля. [проверяет: D8]

9. Закрыть. Кликнуть «Создать» → «Документ подрядчика». В открывшемся
   модальном кликнуть дропдаун «Подрядчик». Скриншот. Убедиться что список
   содержит не менее 10 значений, включая МедиаКрафт, Инфлюенс Групп,
   СтудияПро, АдТех Solutions, ИП Смирнов А.В., ООО МедиаСервис,
   ООО Диджитал Про, ИП Горелова Т.С., ООО Контент Лаб, ИП Рябов Д.О.
   [проверяет: D3] [проверяет: D12] [проверяет: D13]

10. Bash: выполнить `git diff --stat` — убедиться что изменены только файлы
    из D16-списка. [проверяет: D16]

## 6) Финальная сверка с ТЗ

Статус по каждому R (не по D), сверка `git diff` с разделом 2b —
изменения не вышли за перечисленные файлы.

```
npm run lint
npm run typecheck
npm run build
```
Любая падает → статус не "Готово".

Таблица в `IMPLEMENTATION_REPORT.md`:

| R-id | Статус | Где в коде | Комментарий |
|---|---|---|---|
| R1 | | src/mocks/baseClients.ts | |
| R2 | | src/mocks/baseContractors.ts | |
| R3 | | src/utils/clients.ts | |
| R4 | | src/utils/contractors.ts | |
| R5 | | src/components/CreateClientDocModal.tsx | |
| R6 | | src/components/CreateProjectModal.tsx | |
| R7 | | src/components/CreateVendorDocModal.tsx | |
| R8 | | grep-аудит | |

Критическое расхождение — исправить сразу. Некритическое — "реализовано с
отклонением", не округлять до "реализовано". Лимит 3 попытки на пункт
DoD за весь цикл, после — "заблокировано".

**Финальный статус:** Готово / Готово с отклонениями / Заблокировано.

## 7) Режим работы

ЗАПРЕЩЕНО задавать уточняющие вопросы или останавливаться в ожидании ответа в чате
на любом этапе выполнения задачи. При неоднозначности — выбери наиболее вероятную
трактовку, реализуй, опиши допущение только в финальном отчёте. Работай непрерывно
до конца чек-листа без остановок на подтверждение в чате. Исключение — системные
диалоги macOS/терминала (разрешение на запись файлов, bash-команды) — они не текстовые
вопросы, на них запрет не действует.

## Что НЕ включать

- Миграцию `clientName`/`contractorName` в kanbanMockData.ts и
  contractorsKanbanMockData.ts на id-ссылки — это следующая фаза.
- Изменение поля «Ответственный»/«МенДО» — Phase 2 уже закрыта.
- Добавление фильтрации/поиска на страницах канбана — не в scope.
- Роутинг через react-router — не в scope.
- Реальный backend / Supabase-интеграцию.
