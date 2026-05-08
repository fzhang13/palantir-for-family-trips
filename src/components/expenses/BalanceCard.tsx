import type { DebtPair } from '@/utils/expenseCalculations'
import { formatCurrency } from '@/utils/currency'

interface BalanceCardProps {
  debt: DebtPair
  onSettleUp: () => void
}

export function BalanceCard({ debt, onSettleUp }: BalanceCardProps) {
  return (
    <div className="p-4 rounded-lg bg-[#161B22] border-2 border-[#F85149]/30 hover:border-[#F85149]/50 transition-colors">
      <div className="mb-3">
        <div className="text-sm text-[#8B949E] mb-1">
          <span className="text-[#C9D1D9] font-medium">{debt.debtorName}</span> owes
        </div>
        <div className="text-lg font-semibold text-[#C9D1D9]">{debt.creditorName}</div>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-[#F85149] font-mono">
          {formatCurrency(debt.amount)}
        </div>
      </div>

      <button
        onClick={onSettleUp}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-[#238636] rounded hover:bg-[#2EA043] transition-colors"
      >
        Settle Up
      </button>
    </div>
  )
}
