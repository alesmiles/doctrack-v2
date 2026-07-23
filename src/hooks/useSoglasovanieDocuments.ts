import { useSyncExternalStore } from "react";
import { DOCUMENTS as INITIAL_DOCUMENTS, SoglasovanieDocument } from "@/data/soglasovanie-seed";

// Единый источник данных для канбана "Согласование · Документы" и таблицы
// "На подписи" — обе страницы читают один и тот же массив, чтобы подписание
// документа сразу отражалось в обоих местах (R18).
let documents: SoglasovanieDocument[] = INITIAL_DOCUMENTS;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SoglasovanieDocument[] {
  return documents;
}

export function signDocuments(ids: string[]): void {
  const idSet = new Set(ids);
  documents = documents.map((doc) => (idSet.has(doc.id) ? { ...doc, stage: "signed" } : doc));
  notify();
}

export function useSoglasovanieDocuments(): SoglasovanieDocument[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}
