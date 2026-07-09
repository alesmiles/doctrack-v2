import { computeProgress, computeSum } from "../lib/docUtils";
import { Doc, Project } from "../types";

// ─── RAW_PROJECTS data ────────────────────────────────────────────────────────
const RAW_PROJECTS = [
  {
    id: 1, client: "Yandex", code: "YAN-1", period: "March 2026", direction: "Media",
    kam: { initials: "KP", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "IM", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 4500000, link: "12", datePlan: "01.02.2026", dateFact: "28.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Annex", status: "Signed ORIG", sum: 4500000, link: "13", datePlan: "01.02.2026", dateFact: "30.01.2026", estimate: 4200000, comment: "", createdAt: "22.01.2026" },
      { id: 3, type: "Invoice", status: "Sent EDO", sum: 4500000, link: "201", datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "", createdAt: "15.02.2026" },
      { id: 4, type: "UPD", status: "Not Created", sum: null, link: null, datePlan: "15.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 5, type: "Act", status: "Not Created", sum: null, link: null, datePlan: "31.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 2, client: "Yandex", code: "YAN-2", period: "April 2026", direction: "Influence",
    kam: { initials: "KP", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "IM", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Under Review", sum: 2800000, link: null, datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "Awaiting client edits", createdAt: "25.05.2026" },
      { id: 2, type: "Annex", status: "Not Created", sum: null, link: null, datePlan: "10.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Invoice", status: "Not Created", sum: null, link: null, datePlan: "01.04.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 3, client: "Yandex", code: "YAN-3", period: "February 2026", direction: "Context",
    kam: { initials: "AS", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "IM", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 1200000, link: "8", datePlan: "15.01.2026", dateFact: "14.01.2026", estimate: null, comment: "", createdAt: "10.01.2026" },
      { id: 2, type: "Annex", status: "Signed ORIG", sum: 3600000, link: "9", datePlan: "15.01.2026", dateFact: "15.01.2026", estimate: 3600000, comment: "", createdAt: "12.01.2026" },
      { id: 3, type: "Invoice", status: "Sent EDO", sum: 3600000, link: "210", datePlan: "25.05.2026", dateFact: null, estimate: null, comment: "", createdAt: "20.05.2026" },
      { id: 4, type: "Act", status: "Sent ORIG", sum: 3600000, link: "44", datePlan: "28.02.2026", dateFact: null, estimate: null, comment: "", createdAt: "01.06.2026" },
      { id: 5, type: "UPD", status: "Not Created", sum: null, link: null, datePlan: "01.02.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 4, client: "Sber", code: "SBR-1", period: "January 2026", direction: "Media",
    kam: { initials: "AS", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "PV", name: "Полина В.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 8900000, link: "3", datePlan: "01.12.2025", dateFact: "28.11.2025", estimate: null, comment: "", createdAt: "20.11.2025" },
      { id: 2, type: "Annex", status: "Signed ORIG", sum: 8900000, link: "4", datePlan: "01.12.2025", dateFact: "30.11.2025", estimate: 8500000, comment: "", createdAt: "22.11.2025" },
      { id: 3, type: "Order", status: "Signed ORIG", sum: 8900000, link: "5", datePlan: "15.12.2025", dateFact: "14.12.2025", estimate: null, comment: "", createdAt: "10.12.2025" },
      { id: 4, type: "Act", status: "Signed EDO", sum: 8900000, link: "21", datePlan: "31.01.2026", dateFact: "30.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 5, type: "Principal Report", status: "Signed EDO", sum: null, link: "6", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 5, client: "Sber", code: "SBR-2", period: "March 2026", direction: "Influence",
    kam: { initials: "KP", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "PV", name: "Полина В.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 6800000, link: "15", datePlan: "01.02.2026", dateFact: "29.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Annex", status: "Under Review", sum: 6800000, link: null, datePlan: "10.02.2026", dateFact: null, estimate: 6800000, comment: "Pending client signature", createdAt: "01.06.2026" },
      { id: 3, type: "Invoice", status: "Sent EDO", sum: 6800000, link: "305", datePlan: "01.06.2026", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 4, type: "Act", status: "Not Created", sum: null, link: null, datePlan: "31.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 6, client: "Sber", code: "SBR-3", period: "December 2025", direction: "TV",
    kam: { initials: "AS", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "IM", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 15000000, link: "1", datePlan: "01.11.2025", dateFact: "30.10.2025", estimate: null, comment: "", createdAt: "20.10.2025" },
      { id: 2, type: "Order", status: "Signed ORIG", sum: 15000000, link: "2", datePlan: "15.11.2025", dateFact: "14.11.2025", estimate: null, comment: "", createdAt: "10.11.2025" },
      { id: 3, type: "Act", status: "Sent ORIG", sum: 15000000, link: "88", datePlan: "31.12.2025", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 4, type: "Principal Report", status: "Not Created", sum: null, link: null, datePlan: "31.12.2025", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 7, client: "Avito", code: "AVI-1", period: "February 2026", direction: "Influence",
    kam: { initials: "KP", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "PV", name: "Полина В.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 6700000, link: "7", datePlan: "15.01.2026", dateFact: "14.01.2026", estimate: null, comment: "", createdAt: "10.01.2026" },
      { id: 2, type: "Annex", status: "Signed ORIG", sum: 6700000, link: "8", datePlan: "15.01.2026", dateFact: "15.01.2026", estimate: 6400000, comment: "", createdAt: "12.01.2026" },
      { id: 3, type: "Addendum", status: "Signed EDO", sum: null, link: "9", datePlan: "20.01.2026", dateFact: "19.01.2026", estimate: null, comment: "", createdAt: null },
      { id: 4, type: "Invoice", status: "Signed ORIG", sum: 6700000, link: "312", datePlan: "28.02.2026", dateFact: "27.02.2026", estimate: null, comment: "", createdAt: "20.02.2026" },
      { id: 5, type: "UPD", status: "Signed EDO", sum: 6700000, link: "41", datePlan: "28.02.2026", dateFact: "28.02.2026", estimate: null, comment: "", createdAt: null },
      { id: 6, type: "Act", status: "Signed EDO", sum: null, link: "18", datePlan: "28.02.2026", dateFact: "28.02.2026", estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 8, client: "Avito", code: "AVI-2", period: "March 2026", direction: "Media",
    kam: { initials: "AS", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "IM", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Contract", status: "Signed ORIG", sum: 2100000, link: "19", datePlan: "01.02.2026", dateFact: "30.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Annex", status: "Under Review", sum: 2100000, link: null, datePlan: "10.02.2026", dateFact: null, estimate: 2100000, comment: "", createdAt: "29.05.2026" },
      { id: 3, type: "Invoice", status: "Not Created", sum: 2100000, link: null, datePlan: "20.05.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 4, type: "Addendum", status: "Under Review", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "30.05.2026" },
    ],
  },
  {
    id: 9, client: "Avito", code: "AVI-3", period: "April 2026", direction: "Context",
    kam: { initials: "KP", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "PV", name: "Полина В.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Contract", status: "Not Created", sum: null, link: null, datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "Annex", status: "Not Created", sum: null, link: null, datePlan: "10.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 10, client: "Alfa-Bank TG", code: "ALF-8", period: "December 2025", direction: "Influence",
    kam: { initials: "KP", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "IM", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Order", status: "Sent ORIG", sum: 200000000, link: "8", datePlan: "31.05.2025", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 2, type: "Addendum", status: "Signed EDO", sum: null, link: "1", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Principal Report", status: "Signed EDO", sum: null, link: "7", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 4, type: "Agency Contract", status: "Signed ORIG", sum: 190416190, link: null, datePlan: "31.12.2025", dateFact: "26.12.2025", estimate: null, comment: "", createdAt: "20.12.2025" },
      { id: 5, type: "Invoice", status: "Signed ORIG", sum: 3711472, link: "598", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 6, type: "Act", status: "Not Created", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 11, client: "Alfa-Bank TG", code: "ALF-9", period: "February 2026", direction: "Influence",
    kam: { initials: "KP", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "IM", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Order", status: "Not Created", sum: null, link: null, datePlan: "27.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "Addendum", status: "Under Review", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "29.05.2026" },
      { id: 3, type: "Agency Contract", status: "Signed ORIG", sum: 190416190, link: null, datePlan: "27.03.2026", dateFact: "01.04.2026", estimate: null, comment: "OUT | Retargeting 2.0", createdAt: "20.03.2026" },
      { id: 4, type: "Invoice", status: "Sent EDO", sum: 2746446, link: "38", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
    ],
  },
  {
    id: 12, client: "Alfa-Bank TG", code: "ALF-10", period: "March 2026", direction: "Media",
    kam: { initials: "PV", name: "Полина В.", color: "bg-neutral-400" },
    doManager: { initials: "IM", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Agency Contract", status: "Not Created", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "Invoice", status: "Not Created", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Act", status: "Not Created", sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
].map((p) => ({ ...p, progress: computeProgress(p.documents as Doc[]), sum: computeSum(p.documents as Doc[]) })) as Project[];

export { RAW_PROJECTS };
