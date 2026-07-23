import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DIRECTION_LABELS, LegalQueueDocument, isOverdue, overdueDays, waitingDays } from "@/data/soglasovanie-legal-queue";

// R (доработка «убрать чекбоксы»): колонка чекбоксов удалена — 6 треков
// вместо 7, «Документ» теперь первая колонка без начального отступа под
// чекбокс. Ширина «Документ» увеличена, чтобы забрать освободившееся место.
export const QUEUE_ROW_GRID = "minmax(240px,26%) 130px 110px minmax(150px,16%) minmax(160px,18%) minmax(160px,16%)";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

interface SoglasovanieQueueRowProps {
  doc: LegalQueueDocument;
  onOpen: (doc: LegalQueueDocument) => void;
}

// R (доработка 3): статус — не отдельная колонка и не интерактивный элемент
// таблицы, меняется только действиями в боковой панели (getAvailableActions).
export function SoglasovanieQueueRow({ doc, onOpen }: SoglasovanieQueueRowProps) {
  const overdue = isOverdue(doc.deadline);
  const days = overdueDays(doc.deadline);
  // R (доработка 5, второй промпт): подпись «ждём клиента N дн.» переехала
  // из бывшей колонки «Статус» под ячейку «Дедлайн» — единственный
  // оставшийся визуальный индикатор ожидания клиента в таблице.
  const waiting = doc.status === "waiting_client" ? waitingDays(doc.waitingSince) : 0;

  return (
    <div
      data-direction={doc.direction}
      data-status={doc.status}
      className="group grid items-center rounded-lg border border-transparent bg-white hover:border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      style={{ gridTemplateColumns: QUEUE_ROW_GRID }}
      onClick={() => onOpen(doc)}
    >
      {/* Документ */}
      <div className="px-3 py-3 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
        {doc.docType && <div className="text-xs text-gray-400 truncate">{doc.docType}</div>}
      </div>

      {/* Тип */}
      <div className="px-3 py-3">
        {doc.revisionRound === 0 ? (
          <Badge variant="secondary" className="font-normal text-xs border-transparent bg-gray-100 text-gray-600 whitespace-nowrap">
            Первичный
          </Badge>
        ) : (
          <Badge variant="secondary" className="font-normal text-xs border-transparent bg-amber-50 text-amber-700 whitespace-nowrap">
            С правками · {doc.revisionRound}
          </Badge>
        )}
      </div>

      {/* Направление */}
      <div className="px-3 py-3">
        <Badge
          variant="secondary"
          className={cn(
            "font-normal text-xs border-transparent whitespace-nowrap",
            doc.direction === "client" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"
          )}
        >
          {DIRECTION_LABELS[doc.direction]}
        </Badge>
      </div>

      {/* Контрагент */}
      <div className="px-3 py-3 text-sm text-gray-700 truncate">{doc.counterparty}</div>

      {/* Ответственный */}
      <div className="px-3 py-3 text-sm text-gray-700 truncate">{doc.responsible}</div>

      {/* Дедлайн */}
      <div className="px-3 py-3 text-sm whitespace-nowrap">
        {doc.deadline ? (
          <span className={cn(overdue ? "text-red-500" : "text-gray-600")}>
            {formatDate(doc.deadline)}
            {overdue && <span className="ml-1 text-[11px]">+{days}дн.</span>}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
        {waiting > 0 && <div className="text-[11px] text-gray-400">{waiting} дн. ожидания</div>}
      </div>
    </div>
  );
}

export default SoglasovanieQueueRow;
