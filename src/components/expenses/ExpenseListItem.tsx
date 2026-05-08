import { Edit2, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import type { Expense, Family } from '@/types'

interface ExpenseListItemProps {
  expense: Expense
  families: Family[]
  onEdit: () => void
  onDelete: () => void
}

const CATEGORY_ICONS = {
  food: '🍴',
  accommodation: '🏠',
  transport: '🚗',
  activities: '🎯',
  other: '📦',
}

export function ExpenseListItem({ expense, families, onEdit, onDelete }: ExpenseListItemProps) {
  const payer = families.find(f => f.id === expense.payerFamilyId)
  const icon = CATEGORY_ICONS[expense.category]

  const allocationCount = Object.keys(expense.allocations).length
  const splitSummary =
    expense.allocationMode === 'equal'
      ? `Split equally among ${allocationCount} ${allocationCount === 1 ? 'family' : 'families'}`
      : 'Custom split'

  const dateStr = expense.expenseDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#388BFD]/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[#C9D1D9] mb-1">{expense.title}</h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#8B949E]">
            <span>{dateStr}</span>
            <span>•</span>
            <span>Paid by {payer?.name || 'Unknown'}</span>
            <span>•</span>
            <span className="font-mono text-[#C9D1D9]">{formatCurrency(expense.amount)}</span>
          </div>

          <div className="mt-1 text-xs text-[#6E7681]">{splitSummary}</div>

          {expense.note && <div className="mt-2 text-sm text-[#8B949E] italic">{expense.note}</div>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-1.5 text-[#8B949E] hover:text-[#388BFD] hover:bg-[#388BFD]/10 rounded transition-colors"
            aria-label="Edit expense"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-[#8B949E] hover:text-[#F85149] hover:bg-[#F85149]/10 rounded transition-colors"
            aria-label="Delete expense"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
