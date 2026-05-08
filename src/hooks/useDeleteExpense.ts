import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface DeleteExpenseParams {
  tripId: string
  expenseId: string
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ expenseId }: DeleteExpenseParams) => {
      if (!supabase) throw new Error('Supabase not initialized')

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.tripId] })
    },
  })
}
