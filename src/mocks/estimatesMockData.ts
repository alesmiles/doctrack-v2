import { Estimate } from "@/types";

const KIRILL_P = { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" };
const ALINA_S = { initials: "АС", name: "Алина С.", color: "bg-zinc-400" };
const POLINA_V = { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" };

export const estimates: Estimate[] = [
  { id: 1, project: "Ремаркетинг Q3", client: "Яндекс", kam: KIRILL_P, sum: 4750000, status: "На согласовании", createdAt: "02.06.2026", comment: "Ожидаем согласование бюджета", type: "client", responsible: KIRILL_P },
  { id: 2, project: "Баннерная кампания", client: "Сбер", kam: ALINA_S, sum: 1200000, status: "Согласована", createdAt: "28.05.2026", comment: "", type: "client", responsible: ALINA_S },
  { id: 3, project: "Продвижение каталога", client: "Авито", kam: POLINA_V, sum: 5600000, status: "Требует правок", createdAt: "30.05.2026", comment: "Нужно пересчитать по новому брифу", type: "client", responsible: POLINA_V },
  { id: 4, project: "Промо в Telegram", client: "Альфа-Банк ТГ", kam: KIRILL_P, sum: 12000000, status: "Отклонена", createdAt: "15.05.2026", comment: "Клиент отклонил, ждём новый бриф", type: "client", responsible: KIRILL_P },
  { id: 5, project: "Реклама вкладов", client: "Сбер", kam: ALINA_S, sum: 850000, status: "На согласовании", createdAt: "05.06.2026", comment: "", type: "client", responsible: ALINA_S },
  { id: 6, project: "Съёмка роликов", client: "Яндекс", kam: POLINA_V, sum: 3900000, status: "Согласована", createdAt: "20.05.2026", comment: "", type: "contractor", responsible: POLINA_V },
  { id: 7, project: "Дизайн баннеров", client: "Альфа-Банк ТГ", kam: KIRILL_P, sum: 2450000, status: "Требует правок", createdAt: "01.06.2026", comment: "Правки по срокам", type: "contractor", responsible: KIRILL_P },
  { id: 8, project: "Монтаж видео", client: "Авито", kam: ALINA_S, sum: 5000000, status: "Отклонена", createdAt: "10.05.2026", comment: "", type: "contractor", responsible: ALINA_S },
  { id: 9, project: "Копирайтинг постов", client: "Сбер", kam: POLINA_V, sum: 620000, status: "На согласовании", createdAt: "08.06.2026", comment: "", type: "contractor", responsible: POLINA_V },
  { id: 10, project: "Разработка лендинга", client: "Яндекс", kam: KIRILL_P, sum: 7300000, status: "Согласована", createdAt: "18.05.2026", comment: "Финализируем оплату", type: "contractor", responsible: KIRILL_P },
  { id: 11, project: "Аренда площадки", client: "Яндекс", kam: KIRILL_P, sum: 1350000, status: "На согласовании", createdAt: "09.06.2026", comment: "", type: "contractor-project", responsible: KIRILL_P },
  { id: 12, project: "Печать материалов", client: "Сбер", kam: ALINA_S, sum: 480000, status: "Требует правок", createdAt: "03.06.2026", comment: "Нужна замена подрядчика", type: "contractor-project", responsible: ALINA_S },
  { id: 13, project: "Аренда оборудования", client: "Авито", kam: POLINA_V, sum: 920000, status: "Согласована", createdAt: "25.05.2026", comment: "", type: "contractor-project", responsible: POLINA_V },
  { id: 14, project: "Кастинг актёров", client: "Альфа-Банк ТГ", kam: KIRILL_P, sum: 610000, status: "Отклонена", createdAt: "12.05.2026", comment: "Бюджет не согласован", type: "contractor-project", responsible: KIRILL_P },
];

export default estimates;
