import { CurrentUser } from "../types";

// One demo user per role, used by the dev-only role switcher (AppHeader)
// and as `assignee` values in soglasovanie-seed.ts.
export const DEMO_USERS: CurrentUser[] = [
  { id: "user-kam", name: "Инна Михрабова", role: "kam" },
  { id: "user-lawyer", name: "Ольга Заречная", role: "lawyer" },
  { id: "user-producer", name: "Марк Сомов", role: "producer" },
  { id: "user-mendo", name: "Полина Ветрова", role: "mendo" },
  { id: "user-director", name: "Сергей Долин", role: "director", canSign: true },
  { id: "user-findir", name: "Наталья Крюкова", role: "findir" },
];
