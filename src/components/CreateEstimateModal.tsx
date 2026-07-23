import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CreateEstimateModalProps {
  open: boolean
  onClose: () => void
}

export function CreateEstimateModal({ open, onClose }: CreateEstimateModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-[15px] font-semibold text-gray-900">Новая смета</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-500">Форма создания сметы будет добавлена отдельной задачей</p>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateEstimateModal
