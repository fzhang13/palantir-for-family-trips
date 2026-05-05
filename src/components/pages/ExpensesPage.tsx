import { Receipt } from 'lucide-react'

export function ExpensesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Receipt className="w-16 h-16 text-[#8B949E] mb-4" />
      <h2 className="text-2xl font-semibold text-[#C9D1D9] mb-2">
        Expenses
      </h2>
      <p className="text-[#8B949E] text-center max-w-md">
        Track trip expenses, split costs between families, and manage the trip budget.
      </p>
    </div>
  )
}
