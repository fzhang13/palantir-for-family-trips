import { useState } from 'react'
import { ExpenseListItem } from './ExpenseListItem'
import type { Expense, Family } from '@/types'

interface ExpenseListSectionProps {
  expenses: Expense[]
  families: Family[]
  onEdit: (expense: Expense) => void
  onDelete: (expenseId: string) => void
}

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'food', label: 'Food' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'transport', label: 'Transport' },
  { value: 'activities', label: 'Activities' },
  { value: 'other', label: 'Other' },
]

export function ExpenseListSection({
  expenses,
  families,
  onEdit,
  onDelete,
}: ExpenseListSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredExpenses = expenses.filter(exp => {
    if (categoryFilter === 'all') return true
    return exp.category === categoryFilter
  })

  if (expenses.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-5xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-[#C9D1D9] mb-2">No Expenses Yet</h3>
        <p className="text-[#8B949E]">Add your first expense to get started</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#C9D1D9]">All Expenses</h2>
          <p className="text-sm text-[#8B949E]">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
          </p>
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-sm bg-[#0D1117] border border-[#30363D] rounded text-[#C9D1D9] focus:outline-none focus:border-[#388BFD]"
        >
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredExpenses.map(expense => (
          <ExpenseListItem
            key={expense.id}
            expense={expense}
            families={families}
            onEdit={() => onEdit(expense)}
            onDelete={() => {
              if (window.confirm('Delete this expense?')) {
                onDelete(expense.id)
              }
            }}
          />
        ))}
      </div>

      {filteredExpenses.length === 0 && expenses.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-[#8B949E]">No expenses in this category</p>
        </div>
      )}
    </div>
  )
}
