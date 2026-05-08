import { BaseModal } from './BaseModal'
import { ExpenseForm } from '@/components/forms'
import { useFamilies, useActiveTripId, useCreateExpense } from '@/hooks'
import type { ExpenseFormInputs } from '@/types'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const { data: families = [] } = useFamilies()
  const createExpense = useCreateExpense()

  const handleSave = (data: ExpenseFormInputs) => {
    if (!activeTripId) return

    createExpense.mutate(
      { tripId: activeTripId, expense: data },
      {
        onSuccess: () => {
          onClose()
        },
        onError: () => {
          alert('Failed to add expense. Please try again.')
        },
      }
    )
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Add Expense">
      {families.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[#8B949E]">
            No families found. Add families to the trip before creating expenses.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#238636] rounded hover:bg-[#2EA043]"
          >
            Close
          </button>
        </div>
      ) : (
        <ExpenseForm
          families={families}
          onSave={handleSave}
          onCancel={onClose}
          isLoading={createExpense.isPending}
        />
      )}
    </BaseModal>
  )
}
