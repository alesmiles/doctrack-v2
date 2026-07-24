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
