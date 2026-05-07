import { useCallback, useMemo } from 'react'
import type { TripDocument } from '@/types'
import { getFamilyExpenseBurden } from '@/utils/currency'

interface UseExpenseCalculationsReturn {
  familyBurdens: Record<string, number>
  getTotalExpenses: () => number
}

export function useExpenseCalculations(
  doc: TripDocument
): UseExpenseCalculationsReturn {
  const familyBurdens = useMemo(() => {
    return getFamilyExpenseBurden(doc.expenses, doc.families)
  }, [doc.expenses, doc.families])

  const getTotalExpenses = useCallback(() => {
    return doc.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [doc.expenses])

  return {
    familyBurdens,
    getTotalExpenses,
  }
}
