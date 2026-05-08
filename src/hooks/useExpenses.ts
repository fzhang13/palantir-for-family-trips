import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Expense } from '@/types'
import { useActiveTripId } from './useActiveTripId'

export function useExpenses() {
  const { data: activeTripId } = useActiveTripId()

  return useQuery({
    queryKey: ['expenses', activeTripId],
    queryFn: async () => {
      if (!activeTripId || !supabase) return []

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', activeTripId)
        .order('expense_date', { ascending: false })

      if (error) throw error

      return (data || []).map(row => ({
        id: row.id,
        type: 'expense' as const,
        tripId: row.trip_id,
        title: row.title,
        expenseDate: new Date(row.expense_date),
        category: row.category,
        payerFamilyId: row.payer_family_id,
        amount: parseFloat(row.amount),
        allocationMode: row.allocation_mode,
        allocations: row.allocations || {},
        settled: row.settled || false,
        note: row.note,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      })) as Expense[]
    },
    enabled: !!activeTripId && !!supabase,
  })
}
