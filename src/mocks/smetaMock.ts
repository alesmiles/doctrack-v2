export interface SmetaService {
  name: string
  qty: number
  unit: string
  price: number
}

export interface SmetaData {
  projectCode: string
  period: string
  totalAmount: number
  services: SmetaService[]
}

export const SMETA_MOCKS: Record<string, SmetaData> = {
  "ALF-9 · March 2025": {
    projectCode: "ALF-9",
    period: "март — май 2025",
    totalAmount: 394000,
    services: [
      { name: "Размещение у блогеров", qty: 15, unit: "публикаций", price: 20000 },
      { name: "Создание контента", qty: 1, unit: "пакет", price: 64000 },
      { name: "Аналитика и отчётность", qty: 1, unit: "месяц", price: 30000 },
    ],
  },
}

export function getSmetaByProject(project: string): SmetaData | undefined {
  return SMETA_MOCKS[project]
}
