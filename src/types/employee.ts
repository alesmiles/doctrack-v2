export type EmployeeStatus = "active" | "fired";

export interface Employee {
  id: string;
  fullName: string;
  initials: string;
  position: string; // должность, свободный текст (HR-должность, не привязана к RoleId системы ролей)
  phone?: string;
  email?: string;
  status: EmployeeStatus;
  avatarColor?: string;
}
