import { cn } from "@/lib/utils"

interface MarkProps {
  id: string
  type: "error" | "warning"
  resolved: boolean
  resolvedText: string | undefined
  isActive: boolean
  onClick: (id: string) => void
  children: string
  previewMode?: boolean
}

function Mark({ id, type, resolved, resolvedText, isActive, onClick, children, previewMode }: MarkProps) {
  if (resolved || previewMode) {
    return <span>{resolvedText ?? children}</span>
  }
  return (
    <span
      data-issue-id={id}
      onClick={() => onClick(id)}
      className={cn(
        "cursor-pointer rounded-sm transition-all",
        isActive
          ? type === "error"
            ? "bg-red-100 outline outline-2 outline-offset-1 outline-red-400"
            : "bg-yellow-100 outline outline-2 outline-offset-1 outline-yellow-400"
          : type === "error"
          ? "border-b-2 border-red-400 hover:bg-red-50"
          : "border-b-2 border-amber-400 hover:bg-amber-50"
      )}
    >
      {children}
    </span>
  )
}

interface DocumentBodyProps {
  resolvedIds: Set<string>
  resolvedTexts: Map<string, string>
  activeMarkId: string | null
  onMarkClick: (id: string) => void
  previewMode?: boolean
}

export function DocumentBody({ resolvedIds, resolvedTexts, activeMarkId, onMarkClick, previewMode }: DocumentBodyProps) {
  const m = (id: string, type: "error" | "warning", text: string) => (
    <Mark
      id={id}
      type={type}
      resolved={resolvedIds.has(id)}
      resolvedText={resolvedTexts.get(id)}
      isActive={activeMarkId === id}
      onClick={onMarkClick}
      previewMode={previewMode}
    >
      {text}
    </Mark>
  )

  return (
    <div className="max-w-[640px] mx-auto bg-white border border-gray-200 rounded-sm px-14 py-12 min-h-[600px] text-[12px] leading-relaxed text-gray-700">
      <div className="text-right font-semibold text-gray-900 mb-6 leading-6">
        <p>ООО «Альфа Медиа»</p>
        <p>ИНН 7701234567</p>
        <p>г. Москва, ул. Тверская, 12</p>
      </div>

      <div className="flex justify-between font-medium text-gray-900 mb-5">
        <span>г. Москва</span>
        <span>«__» _______ 2025 г.</span>
      </div>

      <p className="text-center font-semibold text-gray-900 mb-0.5">ПРИЛОЖЕНИЕ № 3</p>
      <p className="text-center mb-0.5">к Договору об оказании услуг № 47/2024</p>
      <p className="text-center mb-6">от 10 января 2024 г.</p>

      <p className="mb-4">
        ООО «Агентство», именуемое в дальнейшем «Исполнитель», и ООО «Альфа Медиа»,
        именуемое в дальнейшем «Заказчик», договорились о нижеследующем:
      </p>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">1. ПРЕДМЕТ</p>
        <p className="mb-1">
          1.1. Исполнитель обязуется оказать услуги по размещению рекламных интеграций
          у блогеров в рамках рекламной кампании Заказчика.
        </p>
        <p className="mb-1">Количество размещений: 15 (пятнадцать).</p>
        <p>
          Вид РИМ: {m("rim", "error", "пост / репост / кружок")} — указать разбивку по типам.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">2. СРОКИ</p>
        <p className="mb-1">
          2.1. Начало оказания услуг: с момента подписания настоящего Приложения сторонами.
        </p>
        <p>
          2.2. Срок оказания услуг:{" "}
          {m("period", "warning", "март — июнь 2025 г.")}{" "}
          Рекомендуется уточнить конкретный период.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">3. ПРИЁМКА</p>
        <p className="mb-1">
          3.1. {m("acceptance", "error", "Критерии приёмки не указаны.")}{" "}
          Необходимо добавить критерии для закрытия акта.
        </p>
        <p>
          3.2. {m("content", "warning", "Порядок согласования контента не определён.")}{" "}
          Рекомендуется добавить сроки и порядок согласования.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">4. СТОИМОСТЬ</p>
        <p>
          4.1. Стоимость услуг составляет 394 000 (триста девяносто четыре тысячи) рублей,
          включая НДС 20%.
        </p>
      </div>
    </div>
  )
}
