export interface Person {
  id: string;
  fullName: string;
  role: string;
  phone: string;
  telegram: string;
  email: string;
  isPrimary: boolean;
}

export interface StatusOption {
  label: string;
  color: string;
}

export interface CompanyRecord {
  id: string;
  company: string;
  legalEntities: string[];
  status: string;
  edoSystem: string;
  serviceDirection: string;
  legalAddress: string;
  inn: string;
  kpp: string;
  ogrn: string;
  bankAccount: string;
  bik: string;
  bankName: string;
  responsiblePeople: Person[];
}

export type AccessKey = "clients" | "contractors" | "employees" | "payments" | "base";

export interface EmployeeRecord {
  id: string;
  fullName: string;
  position: string;
  email: string;
  telegram: string;
  phone: string;
  status: string;
  access: Record<AccessKey, boolean>;
  linkedClientIds: string[];
  linkedContractorIds: string[];
}
