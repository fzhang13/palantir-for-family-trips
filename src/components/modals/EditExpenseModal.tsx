import { BaseModal } from './BaseModal'
import { ExpenseForm } from '@/components/forms'
import { useFamilies, useActiveTripId, useUpdateExpense } from '@/hooks'
import type { Expense, ExpenseFormInputs } from '@/types'

interface EditExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense
}

export function EditExpenseModal({ isOpen, onClose, expense }: EditExpenseModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const { data: families = [] } = useFamilies()
  const updateExpense = useUpdateExpense()

  const handleSave = (data: ExpenseFormInputs) => {
    if (!activeTripId) return

    updateExpense.mutate(
      { tripId: activeTripId, expenseId: expense.id, expense: data },
      {
        onSuccess: () => {
          onClose()
        },
        onError: () => {
          alert('Failed to update expense. Please try again.')
        },
      }
    )
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Expense">
      <ExpenseForm
        expense={expense}
        families={families}
        onSave={handleSave}
        onCancel={onClose}
        isLoading={updateExpense.isPending}
      />
    </BaseModal>
  )
}
