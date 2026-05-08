import { useState, useEffect } from 'react'
import { AllocationEditor } from './AllocationEditor'
import { buildEqualExpenseAllocations } from '@/utils/currency'
import type { Expense, Family, ExpenseFormInputs } from '@/types'

interface ExpenseFormProps {
  expense?: Expense
  families: Family[]
  onSave: (data: ExpenseFormInputs) => void
  onCancel: () => void
  isLoading?: boolean
}

const CATEGORY_OPTIONS = [
  { value: 'food', label: 'Food', icon: '🍴' },
  { value: 'accommodation', label: 'Accommodation', icon: '🏠' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'activities', label: 'Activities', icon: '🎯' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const

export function ExpenseForm({
  expense,
  families,
  onSave,
  onCancel,
  isLoading = false,
}: ExpenseFormProps) {
  const [title, setTitle] = useState(expense?.title || '')
  const [expenseDate, setExpenseDate] = useState(expense?.expenseDate || new Date())
  const [category, setCategory] = useState<ExpenseFormInputs['category']>(
    expense?.category || 'other'
  )
  const [payerFamilyId, setPayerFamilyId] = useState(
    expense?.payerFamilyId || families[0]?.id || ''
  )
  const [amount, setAmount] = useState(expense?.amount || 0)
  const [allocationMode, setAllocationMode] = useState<'equal' | 'manual'>(
    expense?.allocationMode || 'equal'
  )
  const [allocations, setAllocations] = useState<Record<string, number>>(
    expense?.allocations ||
      buildEqualExpenseAllocations(
        0,
        families.map(f => f.id)
      )
  )
  const [note, setNote] = useState(expense?.note || '')

  // Initialize allocations when families or amount changes
  useEffect(() => {
    if (!expense && families.length > 0) {
      const initial = buildEqualExpenseAllocations(
        amount,
        families.map(f => f.id)
      )
      setAllocations(initial)
    }
  }, [families, amount, expense])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      expenseDate,
      category,
      payerFamilyId,
      amount,
      allocationMode,
      allocations,
      note: note || undefined,
    })
  }

  const canSubmit = title && payerFamilyId && amount > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="expense-title"
          className="block text-xs font-semibold uppercase tracking-wide text-[#8B949E] mb-1.5"
        >
          Title *
        </label>
        <input
          id="expense-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Groceries at Whole Foods"
          className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#C9D1D9] placeholder-[#6E7681] focus:outline-none focus:border-[#388BFD]"
          required
        />
      </div>

      {/* Date & Category Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="expense-date"
            className="block text-xs font-semibold uppercase tracking-wide text-[#8B949E] mb-1.5"
          >
            Date *
          </label>
          <input
            id="expense-date"
            type="date"
            value={`${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}-${String(expenseDate.getDate()).padStart(2, '0')}`}
            onChange={e => setExpenseDate(new Date(e.target.value + 'T00:00:00'))}
            className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#C9D1D9] focus:outline-none focus:border-[#388BFD]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="expense-category"
            className="block text-xs font-semibold uppercase tracking-wide text-[#8B949E] mb-1.5"
          >
            Category *
          </label>
          <select
            id="expense-category"
            value={category}
            onChange={e => setCategory(e.target.value as ExpenseFormInputs['category'])}
            className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#C9D1D9] focus:outline-none focus:border-[#388BFD]"
            required
          >
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payer & Amount Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="expense-payer"
            className="block text-xs font-semibold uppercase tracking-wide text-[#8B949E] mb-1.5"
          >
            Paid By *
          </label>
          <select
            id="expense-payer"
            value={payerFamilyId}
            onChange={e => setPayerFamilyId(e.target.value)}
            className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#C9D1D9] focus:outline-none focus:border-[#388BFD]"
            required
          >
            {families.map(family => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="expense-amount"
            className="block text-xs font-semibold uppercase tracking-wide text-[#8B949E] mb-1.5"
          >
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-[#8B949E]">$</span>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#C9D1D9] font-mono focus:outline-none focus:border-[#388BFD]"
              required
            />
          </div>
        </div>
      </div>

      {/* Allocation Editor */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#8B949E] mb-2">
          Split Between Families
        </label>
        <AllocationEditor
          totalAmount={amount}
          families={families}
          payerFamilyId={payerFamilyId}
          initialMode={allocationMode}
          initialAllocations={allocations}
          onChange={(mode, newAllocations) => {
            setAllocationMode(mode)
            setAllocations(newAllocations)
          }}
        />
      </div>

      {/* Note */}
      <div>
        <label
          htmlFor="expense-note"
          className="block text-xs font-semibold uppercase tracking-wide text-[#8B949E] mb-1.5"
        >
          Note (Optional)
        </label>
        <textarea
          id="expense-note"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Additional details..."
          rows={3}
          className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded text-[#C9D1D9] placeholder-[#6E7681] focus:outline-none focus:border-[#388BFD] resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-[#C9D1D9] bg-[#21262D] border border-[#30363D] rounded hover:bg-[#30363D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit || isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#238636] rounded hover:bg-[#2EA043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding...' : expense ? 'Save Changes' : 'Add Expense'}
        </button>
      </div>
    </form>
  )
}
