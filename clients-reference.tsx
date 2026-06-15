import { useState, useRef, useCallback } from "react";
import {
  ArrowDown,
  ArrowUp,
  Archive,
  Building,
  ChevronsUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Handshake,
  HardHat,
  MailCheck,
  Plus,
  PlusCircle,
  RussianRuble,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Settings,
  UserCog,
  Users,
  X,
  FileText,
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-06-12");

const STATUSES = [
  "Не создан",
  "На согласовании",
  "Отправлен ЭДО",
  "Отправлен ОРИГ",
  "Подписан ЭДО",
  "Подписан ОРИГ",
] as const;
type Status = (typeof STATUSES)[number];
const FINAL_STATUSES: Status[] = ["Подписан ЭДО", "Подписан ОРИГ"];

const STATUS_COLORS: Record<Status, string> = {
  "Не создан": "#9CA3AF",
  "На согласовании": "#F59E0B",
  "Отправлен ЭДО": "#3B82F6",
  "Отправлен ОРИГ": "#3B82F6",
  "Подписан ЭДО": "#10B981",
  "Подписан ОРИГ": "#10B981",
};
const STATUS_BG: Record<Status, string> = {
  "Не создан": "bg-gray-100 text-gray-700",
  "На согласовании": "bg-amber-50 text-amber-700",
  "Отправлен ЭДО": "bg-blue-50 text-blue-700",
  "Отправлен ОРИГ": "bg-blue-50 text-blue-700",
  "Подписан ЭДО": "bg-emerald-50 text-emerald-700",
  "Подписан ОРИГ": "bg-emerald-50 text-emerald-700",
};

const DOC_TYPE_ORDER = [
  "Договор",
  "Приложение",
  "ДС",
  "Заказ",
  "Счёт",
  "УПД",
  "Акт",
  "Счёт-фактура",
  "Отчёт комитента",
  "Договор агентский",
];

const CLIENT_DOC_TYPES: Record<string, string[]> = {
  Яндекс: ["Договор", "Приложение", "ДС", "Счёт", "УПД", "Акт", "Счёт-фактура"],
  Сбер: ["Договор", "Приложение", "Заказ", "Счёт", "Акт", "Отчёт комитента"],
  Авито: ["Договор", "Приложение", "ДС", "Счёт", "УПД", "Акт"],
  "Альфа-Банк ТГ": ["Заказ", "ДС", "Договор агентский", "Счёт", "Счёт-фактура", "Акт", "УПД", "Отчёт комитента"],
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Doc {
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

interface Person {
  initials: string;
  name: string;
  color: string;
}

interface Project {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU") + " ₽";
}

function getMonthOnly(period: string): string {
  return period.split(" ")[0];
}
function getYearOnly(period: string): string {
  return period.split(" ")[1] ?? "";
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const [d, m, y] = s.split(".");
  return new Date(`${y}-${m}-${d}`);
}

function isOverduePayment(doc: Doc): boolean {
  if (doc.type !== "Счёт") return false;
  if (!doc.datePlan) return false;
  if (FINAL_STATUSES.includes(doc.status)) return false;
  const date = parseDate(doc.datePlan);
  return date != null && date < TODAY;
}

function overdueDays(doc: Doc): number | null {
  if (!isOverduePayment(doc) || !doc.datePlan) return null;
  const date = parseDate(doc.datePlan);
  if (!date) return null;
  const diff = Math.floor((TODAY.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function computeProgress(docs: Doc[]): { done: number; total: number } {
  return { done: docs.filter((d) => FINAL_STATUSES.includes(d.status)).length, total: docs.length };
}

function computeSum(docs: Doc[]): number {
  const sums = docs.map((d) => d.sum ?? 0);
  return sums.reduce((a, b) => a + b, 0);
}

// ─── Test Data ────────────────────────────────────────────────────────────────

const RAW_PROJECTS = [
  {
    id: 1, client: "Яндекс", code: "YAN-1", period: "Март 2026", direction: "Медиа",
    kam: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ" as Status, sum: 4500000, link: "12", datePlan: "01.02.2026", dateFact: "28.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Приложение", status: "Подписан ОРИГ" as Status, sum: 4500000, link: "13", datePlan: "01.02.2026", dateFact: "30.01.2026", estimate: 4200000, comment: "", createdAt: "22.01.2026" },
      { id: 3, type: "Счёт", status: "Отправлен ЭДО" as Status, sum: 4500000, link: "201", datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "", createdAt: "15.02.2026" },
      { id: 4, type: "УПД", status: "Не создан" as Status, sum: null, link: null, datePlan: "15.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 5, type: "Акт", status: "Не создан" as Status, sum: null, link: null, datePlan: "31.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 2, client: "Яндекс", code: "YAN-2", period: "Апрель 2026", direction: "Инфлюенс",
    kam: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Договор", status: "На согласовании" as Status, sum: 2800000, link: null, datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "Ожидаем правки от клиента", createdAt: "25.05.2026" },
      { id: 2, type: "Приложение", status: "Не создан" as Status, sum: null, link: null, datePlan: "10.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Счёт", status: "Не создан" as Status, sum: null, link: null, datePlan: "01.04.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 3, client: "Яндекс", code: "YAN-3", period: "Февраль 2026", direction: "Контекст",
    kam: { initials: "АС", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ" as Status, sum: 1200000, link: "8", datePlan: "15.01.2026", dateFact: "14.01.2026", estimate: null, comment: "", createdAt: "10.01.2026" },
      { id: 2, type: "Приложение", status: "Подписан ОРИГ" as Status, sum: 3600000, link: "9", datePlan: "15.01.2026", dateFact: "15.01.2026", estimate: 3600000, comment: "", createdAt: "12.01.2026" },
      { id: 3, type: "Счёт", status: "Отправлен ЭДО" as Status, sum: 3600000, link: "210", datePlan: "25.05.2026", dateFact: null, estimate: null, comment: "", createdAt: "20.05.2026" },
      { id: 4, type: "Акт", status: "Отправлен ОРИГ" as Status, sum: 3600000, link: "44", datePlan: "28.02.2026", dateFact: null, estimate: null, comment: "", createdAt: "01.06.2026" },
      { id: 5, type: "УПД", status: "Не создан" as Status, sum: null, link: null, datePlan: "01.02.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 4, client: "Сбер", code: "SBR-1", period: "Январь 2026", direction: "Медиа",
    kam: { initials: "АС", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ" as Status, sum: 8900000, link: "3", datePlan: "01.12.2025", dateFact: "28.11.2025", estimate: null, comment: "", createdAt: "20.11.2025" },
      { id: 2, type: "Приложение", status: "Подписан ОРИГ" as Status, sum: 8900000, link: "4", datePlan: "01.12.2025", dateFact: "30.11.2025", estimate: 8500000, comment: "", createdAt: "22.11.2025" },
      { id: 3, type: "Заказ", status: "Подписан ОРИГ" as Status, sum: 8900000, link: "5", datePlan: "15.12.2025", dateFact: "14.12.2025", estimate: null, comment: "", createdAt: "10.12.2025" },
      { id: 4, type: "Акт", status: "Подписан ЭДО" as Status, sum: 8900000, link: "21", datePlan: "31.01.2026", dateFact: "30.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 5, type: "Отчёт комитента", status: "Подписан ЭДО" as Status, sum: null, link: "6", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 5, client: "Сбер", code: "SBR-2", period: "Март 2026", direction: "Инфлюенс",
    kam: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ" as Status, sum: 6800000, link: "15", datePlan: "01.02.2026", dateFact: "29.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Приложение", status: "На согласовании" as Status, sum: 6800000, link: null, datePlan: "10.02.2026", dateFact: null, estimate: 6800000, comment: "На подписи у клиента", createdAt: "01.06.2026" },
      { id: 3, type: "Счёт", status: "Отправлен ЭДО" as Status, sum: 6800000, link: "305", datePlan: "01.06.2026", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 4, type: "Акт", status: "Не создан" as Status, sum: null, link: null, datePlan: "31.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 6, client: "Сбер", code: "SBR-3", period: "Декабрь 2025", direction: "ТВ",
    kam: { initials: "АС", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ" as Status, sum: 15000000, link: "1", datePlan: "01.11.2025", dateFact: "30.10.2025", estimate: null, comment: "", createdAt: "20.10.2025" },
      { id: 2, type: "Заказ", status: "Подписан ОРИГ" as Status, sum: 15000000, link: "2", datePlan: "15.11.2025", dateFact: "14.11.2025", estimate: null, comment: "", createdAt: "10.11.2025" },
      { id: 3, type: "Акт", status: "Отправлен ОРИГ" as Status, sum: 15000000, link: "88", datePlan: "31.12.2025", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 4, type: "Отчёт комитента", status: "Не создан" as Status, sum: null, link: null, datePlan: "31.12.2025", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 7, client: "Авито", code: "AVI-1", period: "Февраль 2026", direction: "Инфлюенс",
    kam: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ" as Status, sum: 6700000, link: "7", datePlan: "15.01.2026", dateFact: "14.01.2026", estimate: null, comment: "", createdAt: "10.01.2026" },
      { id: 2, type: "Приложение", status: "Подписан ОРИГ" as Status, sum: 6700000, link: "8", datePlan: "15.01.2026", dateFact: "15.01.2026", estimate: 6400000, comment: "", createdAt: "12.01.2026" },
      { id: 3, type: "ДС", status: "Подписан ЭДО" as Status, sum: null, link: "9", datePlan: "20.01.2026", dateFact: "19.01.2026", estimate: null, comment: "", createdAt: null },
      { id: 4, type: "Счёт", status: "Подписан ОРИГ" as Status, sum: 6700000, link: "312", datePlan: "28.02.2026", dateFact: "27.02.2026", estimate: null, comment: "", createdAt: "20.02.2026" },
      { id: 5, type: "УПД", status: "Подписан ЭДО" as Status, sum: 6700000, link: "41", datePlan: "28.02.2026", dateFact: "28.02.2026", estimate: null, comment: "", createdAt: null },
      { id: 6, type: "Акт", status: "Подписан ЭДО" as Status, sum: null, link: "18", datePlan: "28.02.2026", dateFact: "28.02.2026", estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 8, client: "Авито", code: "AVI-2", period: "Март 2026", direction: "Медиа",
    kam: { initials: "АС", name: "Алина С.", color: "bg-zinc-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Договор", status: "Подписан ОРИГ" as Status, sum: 2100000, link: "19", datePlan: "01.02.2026", dateFact: "30.01.2026", estimate: null, comment: "", createdAt: "20.01.2026" },
      { id: 2, type: "Приложение", status: "На согласовании" as Status, sum: 2100000, link: null, datePlan: "10.02.2026", dateFact: null, estimate: 2100000, comment: "", createdAt: "29.05.2026" },
      { id: 3, type: "Счёт", status: "Не создан" as Status, sum: 2100000, link: null, datePlan: "20.05.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 4, type: "ДС", status: "На согласовании" as Status, sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "30.05.2026" },
    ],
  },
  {
    id: 9, client: "Авито", code: "AVI-3", period: "Апрель 2026", direction: "Контекст",
    kam: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" },
    documents: [
      { id: 1, type: "Договор", status: "Не создан" as Status, sum: null, link: null, datePlan: "01.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "Приложение", status: "Не создан" as Status, sum: null, link: null, datePlan: "10.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 10, client: "Альфа-Банк ТГ", code: "ALF-8", period: "Декабрь 2025", direction: "Инфлюенс",
    kam: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Заказ", status: "Отправлен ОРИГ" as Status, sum: 200000000, link: "8", datePlan: "31.05.2025", dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
      { id: 2, type: "ДС", status: "Подписан ЭДО" as Status, sum: null, link: "1", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Отчёт комитента", status: "Подписан ЭДО" as Status, sum: null, link: "7", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 4, type: "Договор агентский", status: "Подписан ОРИГ" as Status, sum: 190416190, link: null, datePlan: "31.12.2025", dateFact: "26.12.2025", estimate: null, comment: "", createdAt: "20.12.2025" },
      { id: 5, type: "Счёт", status: "Подписан ОРИГ" as Status, sum: 3711472, link: "598", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 6, type: "Акт", status: "Не создан" as Status, sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
  {
    id: 11, client: "Альфа-Банк ТГ", code: "ALF-9", period: "Февраль 2026", direction: "Инфлюенс",
    kam: { initials: "КП", name: "Кирилл П.", color: "bg-slate-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Заказ", status: "Не создан" as Status, sum: null, link: null, datePlan: "27.03.2026", dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "ДС", status: "На согласовании" as Status, sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "29.05.2026" },
      { id: 3, type: "Договор агентский", status: "Подписан ОРИГ" as Status, sum: 190416190, link: null, datePlan: "27.03.2026", dateFact: "01.04.2026", estimate: null, comment: "ОУТ | Отзывная реклама 2.0", createdAt: "20.03.2026" },
      { id: 4, type: "Счёт", status: "Отправлен ЭДО" as Status, sum: 2746446, link: "38", datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: "25.05.2026" },
    ],
  },
  {
    id: 12, client: "Альфа-Банк ТГ", code: "ALF-10", period: "Март 2026", direction: "Медиа",
    kam: { initials: "ПВ", name: "Полина В.", color: "bg-neutral-400" },
    doManager: { initials: "ИМ", name: "Инна М.", color: "bg-stone-400" },
    documents: [
      { id: 1, type: "Договор агентский", status: "Не создан" as Status, sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 2, type: "Счёт", status: "Не создан" as Status, sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
      { id: 3, type: "Акт", status: "Не создан" as Status, sum: null, link: null, datePlan: null, dateFact: null, estimate: null, comment: "", createdAt: null },
    ],
  },
].map((p) => ({
  ...p,
  progress: computeProgress(p.documents),
  sum: computeSum(p.documents),
})) as Project[];

// ─── Column widths (CSS grid) ────────────────────────────────────────────────

const PROJECT_COL_TEMPLATE = "32px minmax(160px, 16%) minmax(96px, 8%) minmax(88px, 7%) minmax(104px, 9%) minmax(120px, 11%) minmax(120px, 11%) minmax(130px, 12%) 24px minmax(135px, 12%) 24px";
const DOC_COL_TEMPLATE = "40px minmax(140px, 14%) minmax(170px, 16%) minmax(90px, 9%) minmax(100px, 10%) minmax(130px, 11%) minmax(110px, 11%) minmax(110px, 11%) minmax(180px, 13%)";

const MONTH_ORDER = [
  "Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];

// ─── Sortable Doc Row ─────────────────────────────────────────────────────────

function SortableDocRow({
  doc,
  projectId,
  onStatusChange,
  onCommentChange,
}: {
  doc: Doc;
  projectId: number;
  onStatusChange: (pid: number, did: number, s: Status) => void;
  onCommentChange: (pid: number, did: number, v: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `${projectId}-${doc.id}` });

  const paymentOverdue = isOverduePayment(doc);
  const days = overdueDays(doc);

  const [editComment, setEditComment] = useState(false);
  const [commentVal, setCommentVal] = useState(doc.comment);
  const commentRef = useRef<HTMLInputElement>(null);

  const commitComment = () => {
    setEditComment(false);
    onCommentChange(projectId, doc.id, commentVal);
  };
  const isApplication = doc.type === "Приложение";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, display: "grid", gridTemplateColumns: DOC_COL_TEMPLATE, alignItems: "center" }}
      className="group rounded-lg border border-transparent bg-white hover:border-gray-200 hover:bg-gray-50 transition-colors"
    >
      {/* Drag handle */}
      <div className="pl-3 pr-1 py-2.5 w-10">
        <button
          className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex items-center justify-center"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
      {/* Type */}
      <div className="px-3 py-2.5">
        <Badge variant="secondary" className="font-normal text-xs bg-gray-100 text-gray-700 whitespace-nowrap">
          {doc.type}
        </Badge>
      </div>
      {/* Status */}
      <div className="px-3 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer whitespace-nowrap", STATUS_BG[doc.status])}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[doc.status] }} />
              {doc.status}
              <ChevronsUpDown className="w-3 h-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => onStatusChange(projectId, doc.id, s)} className={cn(doc.status === s && "font-semibold")}>
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS[s] }} />
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Sum */}
      <div className="px-3 py-2.5 text-right text-sm tabular-nums whitespace-nowrap">
        {doc.sum != null ? <span className="font-medium">{fmt(doc.sum)}</span> : <span className="text-gray-400">—</span>}
      </div>
      {/* Document № */}
      <div className="px-3 py-2.5">
        {doc.link ? (
          <button className="text-blue-600 hover:text-blue-800 text-sm hover:underline underline-offset-2 transition-colors" onClick={() => console.log("link", doc.link)}>
            {doc.link}
          </button>
        ) : <span className="text-gray-400">—</span>}
      </div>
      {/* Оплата план */}
      <div className="px-3 py-2.5 text-sm text-gray-600 whitespace-nowrap overflow-hidden">
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span>{doc.datePlan ?? "—"}</span>
          {paymentOverdue && days != null && (
            <span className="text-[11px] text-red-500">+{days} дн.</span>
          )}
        </div>
      </div>
      {/* Оплата факт */}
      <div className="px-3 py-2.5 text-sm text-gray-600 whitespace-nowrap">{doc.dateFact ?? "—"}</div>
      {/* Смета — only for Приложение, shows icon if estimate exists */}
      <div className="px-3 py-2.5 text-sm text-gray-800">
        {isApplication ? (
          doc.estimate != null ? (
            <button className="text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center" onClick={() => console.log("open estimate", doc.id)}>
              <FileText className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-gray-400">—</span>
          )
        ) : null}
      </div>
      {/* Comment */}
      <div className="px-3 py-2.5 text-sm text-gray-600 max-w-[180px]">
        {editComment ? (
          <input
            ref={commentRef}
            className="w-full border border-blue-300 rounded px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            value={commentVal}
            onChange={(e) => setCommentVal(e.target.value)}
            onBlur={commitComment}
            onKeyDown={(e) => { if (e.key === "Enter") commitComment(); }}
          />
        ) : (
          <span
            className="cursor-pointer hover:bg-gray-100 rounded px-1.5 py-0.5 -mx-1.5 inline-block min-h-[24px] min-w-[40px] transition-colors"
            onClick={() => { setCommentVal(doc.comment); setEditComment(true); setTimeout(() => commentRef.current?.focus(), 0); }}
          >
            {doc.comment || <span className="text-gray-300 italic">Добавить...</span>}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Sortable Filter Item ─────────────────────────────────────────────────────

function SortableFilterItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex-shrink-0", isDragging && "opacity-50 z-50")}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const sections: Array<{ title: string; items: Array<{ id: string; icon: any; label: string; badge?: number }> }> = [
    {
      title: "ДОКУМЕНТООБОРОТ",
      items: [
        { id: "do-inwork", icon: FileText, label: "ДО в работе", badge: 12 },
        { id: "clients", icon: Users, label: "Клиенты" },
        { id: "contractors", icon: Handshake, label: "Подрядчики" },
      ],
    },
    {
      title: "ПЛАТЕЖИ",
      items: [
        { id: "receivables", icon: RussianRuble, label: "Дебиторка" },
        { id: "topay", icon: MailCheck, label: "На оплату" },
      ],
    },
    {
      title: "БАЗА",
      items: [
        { id: "base-clients", icon: Building, label: "Клиенты" },
        { id: "base-contractors", icon: HardHat, label: "Подрядчики" },
        { id: "employees", icon: UserCog, label: "Сотрудники" },
      ],
    },
    {
      title: "СИСТЕМА",
      items: [
        { id: "archive", icon: Archive, label: "Архив" },
        { id: "settings-nav", icon: Settings, label: "Настройки" },
        { id: "admin", icon: ShieldCheck, label: "Доступы" },
      ],
    },
  ];

  return (
    <aside className={cn("h-screen flex flex-col border-r border-gray-200 bg-white transition-all duration-200 flex-shrink-0", collapsed ? "w-14" : "w-56")}>
      {/* Logo */}
      <div className="flex items-center h-14 border-b border-gray-100 px-4 justify-between">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "gap-3")}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">D</div>
          {!collapsed && <span className="font-semibold text-gray-900 text-sm">DocTrack</span>}
        </div>
        <button
          onClick={onToggle}
          className="rounded-lg w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          title={collapsed ? "Развернуть боковую панель" : "Свернуть боковую панель"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {sections.map((section, sIdx) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <div className="px-2 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{section.title}</div>
            )}

            {/* Создать — regular nav item style */}
            {sIdx === 0 && (
              <DropdownMenu open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      collapsed && "justify-center px-0 w-auto"
                    )}
                    title={collapsed ? "Создать" : undefined}
                  >
                    <PlusCircle className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate">Создать</span>
                        <ChevronDown className={cn("w-3.5 h-3.5 ml-auto opacity-40 transition-transform", isCreateOpen && "rotate-180")} />
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48">
                  <DropdownMenuItem onClick={() => console.log("create project")}>Проект</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log("create document client")}>Документ клиента</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log("create document contractor")}>Документ подрядчика</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {section.items.map((item) => {
              const isActive = item.id === "clients";
              return (
                <button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-blue-600")} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.badge != null && (
                        <span className="ml-auto text-[10px] bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 font-medium">{item.badge}</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className={cn("border-t border-gray-100 p-3 flex items-center gap-3", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">ИМ</div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">Инна Михрабова</div>
            <div className="text-xs text-gray-400 truncate">Менеджер ДО</div>
          </div>
        )}
      </div>

    </aside>
  );
}

// ─── AI Panel ─────────────────────────────────────────────────────────────────

function AIPanel({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const send = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev,
      { role: "user", text: message },
      { role: "ai", text: "Понял ваш запрос! Функция AI-ассистента в разработке." },
    ]);
    setMessage("");
  };
  return (
    <div className="fixed bottom-6 right-6 w-[380px] rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden z-50" style={{ height: "520px" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-50">Новый чат</button>
        <div className="flex items-center gap-1">
          <button className="p-1 text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4" /></button>
          <button className="p-1 text-gray-400 hover:text-gray-600" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-base mb-1.5">Какой у вас вопрос?</p>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">Я помогу разобраться с документооборотом, статусами и проектами DocTrack.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm", m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm")}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-blue-300 focus-within:bg-white transition-colors">
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" placeholder="Напишите вопрос..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
          <button onClick={send} className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors", message.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400")}>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-around mt-2.5 text-[11px] text-gray-400">
          <button className="flex items-center gap-1 hover:text-gray-600 transition-colors"><Archive className="w-3 h-3" /> База знаний</button>
          <button className="flex items-center gap-1 hover:text-gray-600 transition-colors"><Users className="w-3 h-3" /> Поддержка</button>
          <button className="flex items-center gap-1 hover:text-gray-600 transition-colors"><Settings className="w-3 h-3" /> Консультация</button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter definitions ───────────────────────────────────────────────────────

type FilterId = "client" | "kam" | "doctype" | "status";
type OptionalFilterId = "direction" | "year" | "month" | "doManager" | "overdue";

const FILTER_LABELS: Record<FilterId, string> = {
  client: "Клиент",
  kam: "КАМ",
  doctype: "Тип документа",
  status: "Статус",
};
const OPT_FILTER_LABELS: Record<OptionalFilterId, string> = {
  direction: "Направление",
  year: "Год",
  month: "Месяц",
  doManager: "Менеджер ДО",
  overdue: "Просроченные оплаты",
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [projects, setProjects] = useState<Project[]>(RAW_PROJECTS);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [kamFilter, setKamFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // Optional
  const [directionFilter, setDirectionFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("2026");
  const [monthFilter, setMonthFilter] = useState("");
  const [monthSortDir, setMonthSortDir] = useState<"asc" | "desc">("asc");
  const [doManagerFilter, setDoManagerFilter] = useState("");
  const [optEnabled, setOptEnabled] = useState<Record<OptionalFilterId, boolean>>({
    direction: false,
    year: true,
    month: false,
    doManager: false,
    overdue: false,
  });

  // ── Filter bar order (draggable) ──────────────────────────────────────────────
  const [filterOrder, setFilterOrder] = useState<FilterId[]>(["client", "kam", "doctype", "status"]);

  // ── Overdue filter ────────────────────────────────────────────────────────────
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // ── Per-client deleted doc types ──────────────────────────────────────────────
  const [deletedDocTypes, setDeletedDocTypes] = useState<Record<string, Set<string>>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const filterSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // ── Derived ────────────────────────────────────────────────────────────────────
  const clientOptions = Array.from(new Set(projects.map((p) => p.client)));
  const kamOptions = Array.from(new Set(projects.map((p) => p.kam.name)));
  const doManagerOptions = Array.from(new Set(projects.map((p) => p.doManager.name)));
  const directionOptions = Array.from(new Set(projects.map((p) => p.direction)));
  const monthOptions = Array.from(new Set(projects.map((p) => getMonthOnly(p.period))));
  monthOptions.sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
  const yearOptions = Array.from(new Set(projects.map((p) => getYearOnly(p.period)))).sort();

  const getActiveDocTypes = () => {
    const base = clientFilter && CLIENT_DOC_TYPES[clientFilter]
      ? [...CLIENT_DOC_TYPES[clientFilter]]
      : [...DOC_TYPE_ORDER];
    const deleted = deletedDocTypes[clientFilter] ?? new Set<string>();
    return base
      .filter((t) => !deleted.has(t))
      .sort((a, b) => DOC_TYPE_ORDER.indexOf(a) - DOC_TYPE_ORDER.indexOf(b));
  };

  const getAvailableToAdd = () => {
    const base = clientFilter && CLIENT_DOC_TYPES[clientFilter]
      ? [...CLIENT_DOC_TYPES[clientFilter]]
      : [...DOC_TYPE_ORDER];
    const active = new Set(getActiveDocTypes());
    return base.filter((t) => !active.has(t));
  };

  const activeDocTypes = getActiveDocTypes();

  const hasAnyFilter = !!(search || clientFilter || kamFilter || docTypeFilter || statusFilter
    || (optEnabled.direction && directionFilter)
    || (optEnabled.year && yearFilter)
    || (optEnabled.month && monthFilter)
    || (optEnabled.doManager && doManagerFilter)
    || showOverdueOnly);

  const resetFilters = () => {
    setSearch(""); setClientFilter(""); setKamFilter(""); setDocTypeFilter(""); setStatusFilter("");
    setDirectionFilter(""); setYearFilter(""); setMonthFilter(""); setDoManagerFilter(""); setShowOverdueOnly(false);
  };

  // ── Overdue count (only Счёт) ─────────────────────────────────────────────────
  // ── Filtering ──────────────────────────────────────────────────────────────────
  const filteredProjects = projects.filter((p) => {
    if (clientFilter && p.client !== clientFilter) return false;
    if (kamFilter && p.kam.name !== kamFilter) return false;
    if (optEnabled.doManager && doManagerFilter && p.doManager.name !== doManagerFilter) return false;
    if (optEnabled.direction && directionFilter && p.direction !== directionFilter) return false;
    if (optEnabled.year && yearFilter && getYearOnly(p.period) !== yearFilter) return false;
    if (optEnabled.month && monthFilter && getMonthOnly(p.period) !== monthFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.client.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.documents.some((d) => d.type.toLowerCase().includes(q))) return false;
    }
    if (showOverdueOnly && !p.documents.some(isOverduePayment)) return false;
    return true;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const idxA = MONTH_ORDER.indexOf(getMonthOnly(a.period));
    const idxB = MONTH_ORDER.indexOf(getMonthOnly(b.period));
    return monthSortDir === "asc" ? idxA - idxB : idxB - idxA;
  });

  const getFilteredDocs = (p: Project) => {
    let docs = p.documents;
    if (statusFilter) docs = docs.filter((d) => d.status === statusFilter);
    if (docTypeFilter) docs = docs.filter((d) => d.type === docTypeFilter);
    return docs;
  };

  // ── Actions ────────────────────────────────────────────────────────────────────
  const toggleExpand = (id: number) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleStatusChange = (pid: number, did: number, status: Status) =>
    setProjects((prev) => prev.map((p) => p.id !== pid ? p : {
      ...p,
      documents: p.documents.map((d) => d.id !== did ? d : { ...d, status }),
      progress: computeProgress(p.documents.map((d) => d.id !== did ? d : { ...d, status })),
    }));

  const handleCommentChange = (pid: number, did: number, comment: string) =>
    setProjects((prev) => prev.map((p) => p.id !== pid ? p : {
      ...p, documents: p.documents.map((d) => d.id !== did ? d : { ...d, comment }),
    }));

  const handleDocDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const [apStr, adStr] = (active.id as string).split("-");
    const [opStr, odStr] = (over.id as string).split("-");
    const apId = Number(apStr);
    if (apId !== Number(opStr)) return;
    setProjects((prev) => prev.map((p) => {
      if (p.id !== apId) return p;
      const docs = [...p.documents];
      const fi = docs.findIndex((d) => d.id === Number(adStr));
      const ti = docs.findIndex((d) => d.id === Number(odStr));
      if (fi === -1 || ti === -1) return p;
      const [m] = docs.splice(fi, 1);
      docs.splice(ti, 0, m);
      return { ...p, documents: docs };
    }));
  }, []);

  const handleFilterDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFilterOrder((prev) => {
      const oi = prev.indexOf(active.id as FilterId);
      const ni = prev.indexOf(over.id as FilterId);
      return oi === -1 || ni === -1 ? prev : arrayMove(prev, oi, ni);
    });
  };

  const removeDocType = (type: string) => {
    setDeletedDocTypes((prev) => {
      const key = clientFilter || "__all__";
      const existing = prev[key] ?? new Set<string>();
      return { ...prev, [key]: new Set([...existing, type]) };
    });
    if (docTypeFilter === type) setDocTypeFilter("");
  };

  const restoreDocType = (type: string) => {
    setDeletedDocTypes((prev) => {
      const key = clientFilter || "__all__";
      const existing = prev[key] ?? new Set<string>();
      const next = new Set(existing);
      next.delete(type);
      return { ...prev, [key]: next };
    });
  };

  // ── Filter renderers ───────────────────────────────────────────────────────────
  const filterValues: Record<FilterId, string> = {
    client: clientFilter,
    kam: kamFilter,
    doctype: docTypeFilter,
    status: statusFilter,
  };

  const renderFilter = (id: FilterId) => {
    const active = !!filterValues[id];
    const label = FILTER_LABELS[id];

    if (id === "client") return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200 cursor-grab active:cursor-grabbing select-none", active && "text-blue-700 border-blue-300 bg-blue-50")}>
            {clientFilter || label} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setClientFilter("")}>Все клиенты</DropdownMenuItem>
          {clientOptions.map((c) => <DropdownMenuItem key={c} onClick={() => setClientFilter(c)}>{c}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
    );

    if (id === "kam") return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200 cursor-grab active:cursor-grabbing select-none", active && "text-blue-700 border-blue-300 bg-blue-50")}>
            {kamFilter || label} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setKamFilter("")}>Все КАМы</DropdownMenuItem>
          {kamOptions.map((k) => <DropdownMenuItem key={k} onClick={() => setKamFilter(k)}>{k}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
    );

    if (id === "doctype") return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200 cursor-grab active:cursor-grabbing select-none", active && "text-blue-700 border-blue-300 bg-blue-50")}>
            {docTypeFilter || label} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={() => setDocTypeFilter("")}>Все типы</DropdownMenuItem>
          {activeDocTypes.map((t) => (
            <div key={t} className="flex items-center justify-between pr-1 pl-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded-sm" onClick={() => setDocTypeFilter(t)}>
              <span>{t}</span>
              <button
                className="opacity-0 group-hover:opacity-0 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-opacity"
                onClick={(e) => { e.stopPropagation(); removeDocType(t); }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {getAvailableToAdd().length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-gray-400">Добавить</DropdownMenuLabel>
              {getAvailableToAdd().map((t) => (
                <DropdownMenuItem key={t} className="text-gray-400" onClick={() => restoreDocType(t)}>
                  <Plus className="w-3 h-3 mr-1" /> {t}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );

    if (id === "status") return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200 cursor-grab active:cursor-grabbing select-none", active && "text-blue-700 border-blue-300 bg-blue-50")}>
            {statusFilter || label} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setStatusFilter("")}>Все статусы</DropdownMenuItem>
          {STATUSES.map((s) => (
            <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS[s] }} />{s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />

      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
          {hasAnyFilter && (
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={resetFilters}>
              <X className="w-3.5 h-3.5 mr-1" />
              Сбросить всё
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="px-8 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search — not draggable */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Поиск..." className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-52" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Draggable core filters */}
            <DndContext sensors={filterSensors} collisionDetection={closestCenter} onDragEnd={handleFilterDragEnd}>
              <SortableContext items={filterOrder} strategy={horizontalListSortingStrategy}>
                {filterOrder.map((fid) => (
                  <SortableFilterItem key={fid} id={fid}>
                    {renderFilter(fid)}
                  </SortableFilterItem>
                ))}
              </SortableContext>
            </DndContext>

            {/* Optional filters */}
            {optEnabled.direction && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", (optEnabled.direction && directionFilter) && "text-blue-700 border-blue-300 bg-blue-50")}>
                    {directionFilter || "Направление"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDirectionFilter("")}>Все</DropdownMenuItem>
                  {directionOptions.map((d) => <DropdownMenuItem key={d} onClick={() => setDirectionFilter(d)}>{d}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {optEnabled.year && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", (optEnabled.year && yearFilter) && "text-blue-700 border-blue-300 bg-blue-50")}>
                    {yearFilter || "Год"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setYearFilter("")}>Все годы</DropdownMenuItem>
                  {yearOptions.map((y) => <DropdownMenuItem key={y} onClick={() => setYearFilter(y)}>{y}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {optEnabled.month && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", (optEnabled.month && monthFilter) && "text-blue-700 border-blue-300 bg-blue-50")}>
                    {monthFilter || "Месяц"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setMonthFilter("")}>Все месяцы</DropdownMenuItem>
                  {monthOptions.map((m) => <DropdownMenuItem key={m} onClick={() => setMonthFilter(m)}>{m}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {optEnabled.doManager && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-sm bg-gray-50 border-gray-200", (optEnabled.doManager && doManagerFilter) && "text-blue-700 border-blue-300 bg-blue-50")}>
                    {doManagerFilter || "Менеджер ДО"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDoManagerFilter("")}>Все</DropdownMenuItem>
                  {doManagerOptions.map((m) => <DropdownMenuItem key={m} onClick={() => setDoManagerFilter(m)}>{m}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {optEnabled.overdue && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-sm bg-gray-50 text-gray-700 border-gray-200"
                onClick={() => setShowOverdueOnly((p) => !p)}
              >
                Просроченные оплаты
              </Button>
            )}

            {/* Settings gear */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 flex-shrink-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs text-gray-400">Настройка фильтров</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(optEnabled) as OptionalFilterId[]).map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={optEnabled[key]}
                    onCheckedChange={(v) => setOptEnabled((prev) => ({ ...prev, [key]: !!v }))}
                  >
                    {OPT_FILTER_LABELS[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="pb-16">
          {/* Sticky column headers — CSS grid for fixed widths */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
            <div className="px-8 py-2" style={{ display: "grid", gridTemplateColumns: PROJECT_COL_TEMPLATE, alignItems: "center" }}>
              <div className="w-4" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Клиент</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ID проекта</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider transition-colors hover:text-gray-600"
                onClick={() => setMonthSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
              >
                Месяц
                {monthSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Направление</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">КАМ</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Менеджер ДО</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Прогресс</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Сумма</span>
              <div className="w-6" />
            </div>
          </div>

          <div className="px-8 pt-2">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <Search className="w-10 h-10 text-gray-300" />
                <div>
                  <p className="text-gray-700 font-medium text-base">Ничего не найдено</p>
                  <p className="text-gray-400 text-sm mt-1">Попробуйте изменить фильтры</p>
                </div>
              </div>
            ) : (
              sortedProjects.map((project) => {
                const docs = getFilteredDocs(project);
                const isExpanded = expanded.has(project.id);
                const { done, total } = project.progress;
                const pct = total > 0 ? (done / total) * 100 : 0;
                const overduePaymentCount = project.documents.filter(isOverduePayment).length;

                return (
                  <div key={project.id} className="mb-1">
                    {/* Project row — CSS grid for fixed widths */}
                    <div
                      className="px-4 py-3 bg-gray-50/80 rounded-lg cursor-pointer hover:bg-gray-100/70 transition-colors group"
                      style={{ display: "grid", gridTemplateColumns: PROJECT_COL_TEMPLATE, alignItems: "center" }}
                      onClick={() => toggleExpand(project.id)}
                    >
                      <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform flex-shrink-0", !isExpanded && "-rotate-90")} />
                      <span className="font-semibold text-sm text-gray-900 truncate">{project.client}</span>
                      <span className="text-sm text-gray-700 font-medium">{project.code}</span>
                      <span className="text-sm text-gray-500">{getMonthOnly(project.period)}</span>
                      <span className="text-sm text-gray-500">{project.direction}</span>
                      {/* KAM */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0">
                          {project.kam.initials}
                        </div>
                        <span className="text-sm text-gray-600 truncate">{project.kam.name}</span>
                      </div>
                      {/* DO Manager */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0">
                          {project.doManager.initials}
                        </div>
                        <span className="text-sm text-gray-600 truncate">{project.doManager.name}</span>
                      </div>
                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 tabular-nums">{done}/{total}</span>
                      </div>
                      {/* Alert icon */}
                      {overduePaymentCount > 0 && (
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center justify-center h-5 w-5 text-red-500 bg-red-50 rounded-full">
                            <AlertTriangle className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      )}
                      {overduePaymentCount === 0 && <div />}
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(project.sum)}</span>
                      <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                    </div>

                    {/* Documents */}
                    {isExpanded && docs.length > 0 && (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDocDragEnd}>
                        <SortableContext items={docs.map((d) => `${project.id}-${d.id}`)} strategy={verticalListSortingStrategy}>
                          <div className="w-full mt-1">
                            <div className="sticky top-0 z-20 bg-white">
                              <div className="grid text-[10px] uppercase text-gray-400 tracking-wider" style={{ gridTemplateColumns: DOC_COL_TEMPLATE, alignItems: "center" }}>
                                <span className="pl-3">&nbsp;</span>
                                <span className="px-3 py-2 font-medium">Тип</span>
                                <span className="px-3 py-2 font-medium">Статус</span>
                                <span className="px-3 py-2 text-right font-medium">Сумма</span>
                                <span className="px-3 py-2 font-medium">Документ №</span>
                                <span className="px-3 py-2 font-medium">Оплата план</span>
                                <span className="px-3 py-2 font-medium">Оплата факт</span>
                                <span className="px-3 py-2 font-medium">Смета</span>
                                <span className="px-3 py-2 font-medium">Комментарий</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {docs.map((doc) => (
                                <SortableDocRow
                                  key={doc.id}
                                  doc={doc}
                                  projectId={project.id}
                                  onStatusChange={handleStatusChange}
                                  onCommentChange={handleCommentChange}
                                />
                              ))}
                            </div>
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}

                    {isExpanded && (
                      <div className="pl-8 pt-1 pb-2">
                        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors py-1" onClick={(e) => { e.stopPropagation(); console.log("add doc", project.id); }}>
                          + Добавить документ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* AI */}
      {aiOpen ? (
        <AIPanel onClose={() => setAiOpen(false)} />
      ) : (
        <button onClick={() => setAiOpen(true)} className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50">
          <Sparkles className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
