import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  useExpenses,
  useFamilies,
  useDeleteExpense,
  useActiveTripId,
  useExpenseBalances,
} from '@/hooks'
import { BalanceSummarySection, ExpenseListSection } from '@/components/expenses'
import { AddExpenseModal, EditExpenseModal } from '@/components/modals'
import type { Expense } from '@/types'

export function ExpensesPage() {
  const { data: activeTripId } = useActiveTripId()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: families = [], isLoading: familiesLoading } = useFamilies()
  const { debts, isLoading: balancesLoading } = useExpenseBalances()
  const deleteExpense = useDeleteExpense()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const handleDelete = (expenseId: string) => {
    if (!activeTripId) return
    deleteExpense.mutate({ tripId: activeTripId, expenseId })
  }

  const isLoading = expensesLoading || familiesLoading || balancesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#8B949E]">Loading expenses...</div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-[#0A0C10]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B949E] mb-1">
            Trip Finances
          </div>
          <h1 className="text-2xl font-bold text-[#C9D1D9]">Expenses</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={families.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add new expense"
        >
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {families.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border border-[#30363D] rounded bg-[#161B22]">
          <p className="text-[#8B949E] text-lg mb-2">No families in this trip</p>
          <p className="text-[#8B949E] text-sm">Add families before tracking expenses</p>
        </div>
      ) : (
        <>
          {/* Balance Summary Section */}
          <div className="mb-8">
            <BalanceSummarySection debts={debts} />
          </div>

          {/* Divider */}
          <div className="border-t border-[#30363D] my-8" />

          {/* Expense List Section */}
          <ExpenseListSection
            expenses={expenses}
            families={families}
            onEdit={setEditingExpense}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          isOpen={true}
          onClose={() => setEditingExpense(null)}
          expense={editingExpense}
        />
      )}
    </div>
  )
}
