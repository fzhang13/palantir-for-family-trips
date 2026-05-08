import { useState, useEffect } from 'react'
import type { Family } from '@/types'
import { buildEqualExpenseAllocations, validateAllocations } from '@/utils/currency'

interface AllocationEditorProps {
  totalAmount: number
  families: Family[]
  payerFamilyId: string
  initialMode: 'equal' | 'manual'
  initialAllocations: Record<string, number>
  onChange: (mode: 'equal' | 'manual', allocations: Record<string, number>) => void
}

export function AllocationEditor({
  totalAmount,
  families,
  payerFamilyId,
  initialMode,
  initialAllocations,
  onChange,
}: AllocationEditorProps) {
  const [mode, setMode] = useState<'equal' | 'manual'>(initialMode)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(Object.keys(initialAllocations).filter(id => initialAllocations[id] > 0))
  )
  const [amounts, setAmounts] = useState<Record<string, number>>(initialAllocations)
  const [inputValues, setInputValues] = useState<Record<string, string>>(() =>
    Object.entries(initialAllocations).reduce(
      (acc, [id, amount]) => {
        acc[id] = amount.toFixed(2)
        return acc
      },
      {} as Record<string, string>
    )
  )

  // Recalculate equal-mode allocations when mode, selection, or total changes
  useEffect(() => {
    if (mode === 'equal') {
      const equalAllocations = buildEqualExpenseAllocations(totalAmount, Array.from(selectedIds))
      setAmounts(equalAllocations)
      setInputValues(
        Object.entries(equalAllocations).reduce(
          (acc, [id, amount]) => {
            acc[id] = amount.toFixed(2)
            return acc
          },
          {} as Record<string, string>
        )
      )
      onChange('equal', equalAllocations)
    }
  }, [mode, selectedIds, totalAmount, onChange])

  const handleToggleFamily = (familyId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(familyId)) {
      newSelected.delete(familyId)
    } else {
      newSelected.add(familyId)
    }
    setSelectedIds(newSelected)
  }

  const handleModeChange = (newMode: 'equal' | 'manual') => {
    setMode(newMode)
    if (newMode === 'manual') {
      // Convert current equal split to manual
      onChange('manual', amounts)
    }
  }

  const handleAmountChange = (familyId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [familyId]: value }))
  }

  const handleAmountBlur = (familyId: string) => {
    const stringValue = inputValues[familyId] || '0'
    const parsed = parseFloat(stringValue) || 0
    const newAmounts = { ...amounts, [familyId]: parsed }
    setAmounts(newAmounts)
    setInputValues(prev => ({ ...prev, [familyId]: parsed.toFixed(2) }))
    onChange('manual', newAmounts)
  }

  const validation = validateAllocations(totalAmount, amounts, payerFamilyId)
  const sum = Object.values(amounts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleModeChange('equal')}
          className={`px-3 py-1.5 text-sm rounded ${
            mode === 'equal'
              ? 'bg-[#238636] text-white'
              : 'bg-[#21262D] text-[#8B949E] hover:bg-[#30363D]'
          }`}
        >
          Equal Split
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('manual')}
          className={`px-3 py-1.5 text-sm rounded ${
            mode === 'manual'
              ? 'bg-[#238636] text-white'
              : 'bg-[#21262D] text-[#8B949E] hover:bg-[#30363D]'
          }`}
        >
          Custom Split
        </button>
      </div>

      {/* Family List */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#8B949E]">
          Participating Families
        </div>
        {families.map(family => {
          const isSelected = selectedIds.has(family.id)
          const amount = amounts[family.id] || 0

          return (
            <div
              key={family.id}
              className="flex items-center gap-3 p-2 rounded bg-[#161B22] border border-[#30363D]"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleFamily(family.id)}
                  aria-label={`Include ${family.name} in allocation`}
                  className="w-4 h-4"
                />
                <div className="text-sm text-[#C9D1D9]">{family.name}</div>
              </label>
              <div className="flex-1"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8B949E]">$</span>
                {mode === 'equal' ? (
                  <span className="font-mono text-sm text-[#C9D1D9] w-20 text-right">
                    {isSelected ? amount.toFixed(2) : '0.00'}
                  </span>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={inputValues[family.id] || '0.00'}
                    onChange={e => handleAmountChange(family.id, e.target.value)}
                    onBlur={() => handleAmountBlur(family.id)}
                    disabled={!isSelected}
                    aria-label={`Allocation amount for ${family.name}`}
                    className="w-20 px-2 py-1 text-right font-mono text-sm bg-[#0D1117] border border-[#30363D] rounded text-[#C9D1D9] focus:outline-none focus:border-[#388BFD] disabled:opacity-50"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Validation Summary */}
      <div
        role="status"
        aria-label={`Allocation validation: ${validation.valid ? 'valid' : 'invalid'}`}
        className="flex items-center justify-between p-2 rounded bg-[#161B22] border border-[#30363D]"
      >
        <span className="text-sm text-[#8B949E]">Total Allocated:</span>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-sm ${validation.valid ? 'text-[#3FB950]' : 'text-[#F85149]'}`}
          >
            ${sum.toFixed(2)}
          </span>
          <span className="text-xs text-[#8B949E]">/ ${totalAmount.toFixed(2)}</span>
          {validation.valid ? (
            <span className="text-[#3FB950]" aria-hidden="false">
              ✓
            </span>
          ) : (
            <span className="text-[#F85149]" aria-hidden="false">
              ✗
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {!validation.valid && validation.error && (
        <div className="p-2 rounded bg-[#F85149]/10 border border-[#F85149]/30">
          <p className="text-xs text-[#F85149]">{validation.error}</p>
        </div>
      )}
    </div>
  )
}
