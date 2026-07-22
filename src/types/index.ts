import { STATUSES } from "../constants";

export type Status = (typeof STATUSES)[number];

export interface Doc {
  id: number;
  type: string;
  status: Status;
  sum: number | null;
  link: string | null;
  datePlan: string | null;
  dateFact: string | null;
  estimate: number | null;
  comment: string;
  createdAt: string | null;
}

export interface Person {
  initials: string;
  name: string;
  color: string;
}

export interface Project {
  id: number;
  client: string;
  code: string;
  period: string;
  direction: string;
  kam: Person;
  doManager: Person;
  progress: { done: number; total: number };
  sum: number;
  documents: Doc[];
}

export type ContractorDocStatus =
  | "Not Created"
  | "Requested"
  | "Received"
  | "Signed ORIG"
  | "Signed EDO";

export interface ContractorDoc {
  id: number;
  type: string;
  status: ContractorDocStatus;
  sum: number | null;
  docNumber: string | null;
  datePlan: string | null;
  dateFact: string | null;
  hasFile: boolean;
  comment: string;
  isOverdue?: boolean;
  overdueDays?: number;
}

export interface ContractorProject {
  id: number;
  contractor: string;
  projectCode: string;
  month: string;
  year: number;
  client?: string;
  direction: string;
  responsible: Person;
  doManager: Person;
  progress: { done: number; total: number };
  sum: number;
  isOverdue: boolean;
  documents: ContractorDoc[];
}

export type UserRole = "kam" | "lawyer" | "producer" | "mendo" | "director" | "findir";

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
}

export type EstimateStatus = "На согласовании" | "Согласована" | "Требует правок" | "Отклонена";

export interface Estimate {
  id: number;
  project: string;
  client: string;
  kam: Person;
  sum: number;
  status: EstimateStatus;
  createdAt: string;
  comment: string;
  type: "client" | "contractor" | "contractor-project";
  responsible: Person;
}

export default {};
