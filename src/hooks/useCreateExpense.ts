import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExpenseFormInputs } from '@/types'

interface CreateExpenseParams {
  tripId: string
  expense: ExpenseFormInputs
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tripId, expense }: CreateExpenseParams) => {
      if (!supabase) throw new Error('Supabase not initialized')

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          trip_id: tripId,
          title: expense.title,
          expense_date: expense.expenseDate.toISOString().split('T')[0],
          category: expense.category,
          payer_family_id: expense.payerFamilyId,
          amount: expense.amount,
          allocation_mode: expense.allocationMode,
          allocations: expense.allocations,
          note: expense.note,
          settled: false,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.tripId] })
    },
  })
}
