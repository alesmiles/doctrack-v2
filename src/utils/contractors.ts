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
