import { useCallback, useMemo } from 'react'
import type { TripDocument, Expense } from '@/types'
import { getFamilyExpenseBurden } from '@/utils/currency'

interface UseExpenseCalculationsReturn {
  familyBurdens: Record<string, number>
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void
  getTotalExpenses: () => number
}

export function useExpenseCalculations(
  doc: TripDocument,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseExpenseCalculationsReturn {
  const familyBurdens = useMemo(() => {
    return getFamilyExpenseBurden(doc.expenses, doc.families)
  }, [doc.expenses, doc.families])

  const updateExpense = useCallback(
    (expenseId: string, updates: Partial<Expense>) => {
      onUpdateDoc((doc) => ({
        ...doc,
        expenses: doc.expenses.map((exp) =>
          exp.id === expenseId ? { ...exp, ...updates } : exp
        ),
      }))
    },
    [onUpdateDoc]
  )

  const getTotalExpenses = useCallback(() => {
    return doc.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [doc.expenses])

  return {
    familyBurdens,
    updateExpense,
    getTotalExpenses,
  }
}
