// В проде статус/просрочка приходят из 1С; здесь — фронтовая симуляция от planDate/factDate.
import { TODAY } from "../constants";

export type PaymentStatus = "paid" | "overdue" | "due_soon" | "awaiting";

const DUE_SOON_DAYS = 7;

function parseDateStr(s: string | null): Date | null {
  if (!s) return null;
  const [d, m, y] = s.split(".");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

export function computeOverdueDays(planDate: string | null, factDate: string | null): number {
  if (factDate) return 0;
  const plan = parseDateStr(planDate);
  if (!plan) return 0;
  return Math.max(0, Math.floor((TODAY.getTime() - plan.getTime()) / 86_400_000));
}

export function computePaymentStatus(planDate: string | null, factDate: string | null): PaymentStatus {
  if (factDate) return "paid";
  const plan = parseDateStr(planDate);
  if (!plan) return "awaiting";
  const diffDays = Math.floor((plan.getTime() - TODAY.getTime()) / 86_400_000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= DUE_SOON_DAYS) return "due_soon";
  return "awaiting";
}
