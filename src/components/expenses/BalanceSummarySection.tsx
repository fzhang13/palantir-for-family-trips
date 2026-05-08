import { BalanceCard } from './BalanceCard'
import { useActiveTripId } from '@/hooks'
import type { DebtPair } from '@/utils/expenseCalculations'

interface BalanceSummarySectionProps {
  debts: DebtPair[]
}

export function BalanceSummarySection({ debts }: BalanceSummarySectionProps) {
  const { data: activeTripId } = useActiveTripId()

  const handleSettleUp = () => {
    if (!activeTripId) return

    const confirmed = window.confirm(
      'Mark all expenses as settled? This will update all expenses in this trip.'
    )

    if (confirmed) {
      // Phase 1: Simple all-or-nothing settlement
      // Future: implement per-debt settlement with payments table
      alert('Settlement tracking coming in Phase 2!')
    }
  }

  if (debts.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-semibold text-[#3FB950] mb-2">All Settled!</h3>
        <p className="text-[#8B949E]">No outstanding balances</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#C9D1D9]">Balance Summary</h2>
        <p className="text-sm text-[#8B949E]">Who owes whom</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {debts.map((debt, idx) => (
          <BalanceCard
            key={`${debt.debtorId}-${debt.creditorId}-${idx}`}
            debt={debt}
            onSettleUp={handleSettleUp}
          />
        ))}
      </div>
    </div>
  )
}
