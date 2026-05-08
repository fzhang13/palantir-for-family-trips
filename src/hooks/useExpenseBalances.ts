import { useMemo } from 'react'
import { useExpenses } from './useExpenses'
import { useFamilies } from './useTripQueries'
import { calculateFamilyBalances, calculateDebtPairs } from '@/utils/expenseCalculations'
import type { FamilyBalance, DebtPair } from '@/utils/expenseCalculations'

interface UseExpenseBalancesReturn {
  balances: FamilyBalance[]
  debts: DebtPair[]
  isLoading: boolean
}

export function useExpenseBalances(): UseExpenseBalancesReturn {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: families = [], isLoading: familiesLoading } = useFamilies()

  const balances = useMemo(() => {
    return calculateFamilyBalances(expenses, families)
  }, [expenses, families])

  const debts = useMemo(() => {
    return calculateDebtPairs(balances)
  }, [balances])

  return {
    balances,
    debts,
    isLoading: expensesLoading || familiesLoading,
  }
}
