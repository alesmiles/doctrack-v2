import { cn } from "@/lib/utils"
import type { SmetaData } from "@/mocks/smetaMock"

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

function formatAmount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

interface DocumentBodyProps {
  resolvedIds: Set<string>
  resolvedTexts: Map<string, string>
  activeMarkId: string | null
  onMarkClick: (id: string) => void
  previewMode?: boolean
  smetaData?: SmetaData
}

export function DocumentBody({ resolvedIds, resolvedTexts, activeMarkId, onMarkClick, previewMode, smetaData }: DocumentBodyProps) {
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
        <p>г. Москва, ул. Тверская, д. 12</p>
      </div>

      <div className="flex justify-between font-medium text-gray-900 mb-5">
        <span>Москва</span>
        <span>___ _________ 2025</span>
      </div>

      <p className="text-center font-semibold text-gray-900 mb-0.5">ПРИЛОЖЕНИЕ № 3</p>
      <p className="text-center mb-0.5">к Договору оказания услуг № 47/2024</p>
      <p className="text-center mb-6">от 10 января 2024 г.</p>

      <p className="mb-4">
        ООО «Агентство», именуемое в дальнейшем «Исполнитель», и ООО «Альфа Медиа»,
        именуемое в дальнейшем «Заказчик», заключили настоящее Приложение о нижеследующем:
      </p>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">1. ПРЕДМЕТ ДОГОВОРА</p>
        {smetaData ? (
          <>
            <p className="mb-1">
              1.1. Исполнитель обязуется оказать Заказчику следующие услуги по проекту «{smetaData.projectCode}»:
            </p>
            <ul className="list-disc pl-5 mb-1">
              {smetaData.services.map((s) => (
                <li key={s.name}>
                  {s.name} — {s.qty} {s.unit} × {formatAmount(s.price)} руб.
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="mb-1">
              1.1. Исполнитель обязуется организовать рекламные интеграции с блогерами
              в рамках рекламной кампании Заказчика.
            </p>
            <p className="mb-1">Количество размещений: 15 (пятнадцать).</p>
            <p>
              Формат размещения: {m("rim", "error", "пост / репост / сторис")} — указать разбивку по типам.
            </p>
          </>
        )}
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">2. СРОКИ</p>
        <p className="mb-1">
          2.1. Начало оказания услуг: с момента подписания настоящего Приложения обеими сторонами.
        </p>
        {smetaData ? (
          <p>2.2. Срок оказания услуг: {smetaData.period}.</p>
        ) : (
          <p>
            2.2. Срок оказания услуг:{" "}
            {m("period", "warning", "март — июнь 2025")}{" "}
            Рекомендуется указать точный период для контроля сроков.
          </p>
        )}
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">3. ПРИЁМКА</p>
        <p className="mb-1">
          3.1. {m("acceptance", "error", "Критерии приёмки не указаны.")}{" "}
          Необходимо добавить критерии для возможности подписания акта приёмки.
        </p>
        <p>
          3.2. {m("content", "warning", "Порядок согласования контента не определён.")}{" "}
          Рекомендуется указать сроки и порядок согласования.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">4. СТОИМОСТЬ</p>
        {smetaData ? (
          <p>
            4.1. Общая стоимость услуг по проекту «{smetaData.projectCode}» составляет{" "}
            {formatAmount(smetaData.totalAmount)} рублей, включая НДС 20%.
          </p>
        ) : (
          <p>
            4.1. Общая стоимость услуг составляет 394 000 (триста девяносто четыре тысячи) рублей,
            включая НДС 20%.
          </p>
        )}
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">5. ПОРЯДОК РАСЧЁТОВ</p>
        <p className="mb-1">
          5.1. Оплата услуг производится в следующем порядке: 50% (пятьдесят процентов) —
          предоплата в течение 5 (пяти) банковских дней с даты подписания настоящего
          Приложения; 50% (пятьдесят процентов) — постоплата в течение 5 (пяти) банковских
          дней после подписания сторонами акта приёмки услуг.
        </p>
        <p>
          5.2. Срок оплаты выставленного Исполнителем счёта — 5 (пять) банковских дней с даты
          выставления счёта.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">6. ОТВЕТСТВЕННОСТЬ СТОРОН</p>
        <p className="mb-1">
          6.1. За нарушение сроков оплаты Заказчик уплачивает Исполнителю пеню в размере 0,1%
          (ноль целых одна десятая процента) от неоплаченной суммы за каждый день просрочки.
        </p>
        <p>
          6.2. За нарушение сроков оказания услуг Исполнитель уплачивает Заказчику пеню в
          размере 0,1% (ноль целых одна десятая процента) от стоимости несвоевременно
          оказанных услуг за каждый день просрочки.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">7. ПРОЧИЕ УСЛОВИЯ</p>
        <p className="mb-1">
          7.1. Настоящее Приложение вступает в силу с момента подписания обеими сторонами и
          действует до полного исполнения сторонами своих обязательств.
        </p>
        <p className="mb-1">
          7.2. Настоящее Приложение составлено в 2 (двух) экземплярах, имеющих одинаковую
          юридическую силу, по одному экземпляру для каждой из сторон.
        </p>
        <p>
          7.3. Во всём, что не предусмотрено настоящим Приложением, стороны руководствуются
          действующим законодательством Российской Федерации.
        </p>
      </div>

      <div>
        <p className="font-semibold text-gray-900 mb-3">8. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Исполнитель</p>
            <p>ООО «Агентство»</p>
            <p>ИНН 7704111222 / КПП 770401001</p>
            <p>Юр. адрес: г. Москва, Пресненская наб., д. 6</p>
            <p>Р/с 40702810900000012345</p>
            <p>Банк: ПАО Сбербанк, г. Москва</p>
            <p>К/с 30101810400000000225, БИК 044525225</p>
            <p className="mt-4">Подпись: ______________________</p>
            <p>Ф.И.О.: ______________________</p>
            <p>Печать</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Заказчик</p>
            {smetaData ? (
              <>
                <p>ООО «Альфа Медиа»</p>
                <p>ИНН 7701234567 / КПП 770101001</p>
                <p>Юр. адрес: г. Москва, ул. Тверская, д. 12</p>
                <p>Р/с 40702810100000054321</p>
                <p>Банк: ПАО «Альфа-Банк», г. Москва</p>
                <p>К/с 30101810200000000593, БИК 044525593</p>
              </>
            ) : (
              <>
                <p>______________________</p>
                <p>ИНН ______________________</p>
                <p>Юр. адрес: ______________________</p>
                <p>Р/с ______________________</p>
                <p>Банк: ______________________</p>
                <p>К/с ______________________, БИК ______________________</p>
              </>
            )}
            <p className="mt-4">Подпись: ______________________</p>
            <p>Ф.И.О.: ______________________</p>
            <p>Печать</p>
          </div>
        </div>
      </div>
    </div>
  )
}
