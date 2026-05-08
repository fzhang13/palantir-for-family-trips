import { useCallback, useMemo } from 'react'
import type { TripDocument } from '@/types'
import { calculateFamilyBalances } from '@/utils/expenseCalculations'

interface UseExpenseCalculationsReturn {
  familyBurdens: Record<string, number>
  getTotalExpenses: () => number
}

export function useExpenseCalculations(
  doc: TripDocument
): UseExpenseCalculationsReturn {
  const familyBurdens = useMemo(() => {
    const balances = calculateFamilyBalances(doc.expenses, doc.families)
    const burdens: Record<string, number> = {}
    balances.forEach(balance => {
      burdens[balance.familyId] = balance.totalOwed
    })
    return burdens
  }, [doc.expenses, doc.families])

  const getTotalExpenses = useCallback(() => {
    return doc.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [doc.expenses])

  return {
    familyBurdens,
    getTotalExpenses,
  }
}
