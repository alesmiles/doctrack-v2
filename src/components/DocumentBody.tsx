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
        <p>Alpha Media LLC</p>
        <p>TIN 7701234567</p>
        <p>12 Tverskaya St., Moscow</p>
      </div>

      <div className="flex justify-between font-medium text-gray-900 mb-5">
        <span>Moscow</span>
        <span>___ _________ 2025</span>
      </div>

      <p className="text-center font-semibold text-gray-900 mb-0.5">ANNEX NO. 3</p>
      <p className="text-center mb-0.5">to the Service Agreement No. 47/2024</p>
      <p className="text-center mb-6">dated January 10, 2024</p>

      <p className="mb-4">
        Agency LLC, hereinafter referred to as the "Service Provider", and Alpha Media LLC,
        hereinafter referred to as the "Client", have agreed as follows:
      </p>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">1. SCOPE OF WORK</p>
        <p className="mb-1">
          1.1. The Service Provider undertakes to arrange advertising integrations
          with bloggers as part of the Client's advertising campaign.
        </p>
        <p className="mb-1">Number of placements: 15 (fifteen).</p>
        <p>
          Ad Format: {m("rim", "error", "post / repost / story")} — specify breakdown by type.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">2. TIMELINE</p>
        <p className="mb-1">
          2.1. Service commencement: upon signing of this Annex by both parties.
        </p>
        <p>
          2.2. Service period:{" "}
          {m("period", "warning", "March — June 2025")}{" "}
          An exact period is recommended for delivery tracking.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">3. ACCEPTANCE</p>
        <p className="mb-1">
          3.1. {m("acceptance", "error", "Acceptance criteria not specified.")}{" "}
          Criteria must be added to enable act signing.
        </p>
        <p>
          3.2. {m("content", "warning", "Content approval procedure not defined.")}{" "}
          It is recommended to specify deadlines and approval procedure.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-900 mb-1">4. FEES</p>
        <p>
          4.1. The total fee for the services amounts to 394,000 (three hundred ninety-four thousand) rubles,
          inclusive of 20% VAT.
        </p>
      </div>
    </div>
  )
}
