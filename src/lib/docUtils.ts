import { TODAY } from "../constants";
import { Doc } from "../types";
import { FINAL_STATUSES } from "../constants";

export function fmt(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU") + " ₽";
}

export function getMonthOnly(period: string): string {
  return period.split(" ")[0];
}
export function getYearOnly(period: string): string {
  return period.split(" ")[1] ?? "";
}

export function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const [d, m, y] = s.split(".");
  return new Date(`${y}-${m}-${d}`);
}

export function isOverduePayment(doc: Doc): boolean {
  if (doc.type !== "Счёт") return false;
  if (!doc.datePlan) return false;
  if ((FINAL_STATUSES as readonly string[]).includes(doc.status as string)) return false;
  const date = parseDate(doc.datePlan);
  return date != null && date < TODAY;
}

export function overdueDays(doc: Doc): number | null {
  if (!isOverduePayment(doc) || !doc.datePlan) return null;
  const date = parseDate(doc.datePlan);
  if (!date) return null;
  const diff = Math.floor((TODAY.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function computeProgress(docs: Doc[]): { done: number; total: number } {
  return { done: docs.filter((d) => (FINAL_STATUSES as readonly string[]).includes(d.status as string)).length, total: docs.length };
}

export function computeSum(docs: Doc[]): number {
  const sums = docs.map((d) => d.sum ?? 0);
  return sums.reduce((a, b) => a + b, 0);
}
