import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExpenseFormInputs } from '@/types'

interface UpdateExpenseParams {
  tripId: string
  expenseId: string
  expense: ExpenseFormInputs
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ expenseId, expense }: UpdateExpenseParams) => {
      if (!supabase) throw new Error('Supabase not initialized')

      const { data, error } = await supabase
        .from('expenses')
        .update({
          title: expense.title,
          expense_date: expense.expenseDate.toISOString().split('T')[0],
          category: expense.category,
          payer_family_id: expense.payerFamilyId,
          amount: expense.amount,
          allocation_mode: expense.allocationMode,
          allocations: expense.allocations,
          note: expense.note,
        })
        .eq('id', expenseId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.tripId] })
    },
  })
}
