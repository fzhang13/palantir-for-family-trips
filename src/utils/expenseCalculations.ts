import type { Expense, Family } from '@/types'

export interface FamilyBalance {
  familyId: string
  familyName: string
  netPosition: number
  totalPaid: number
  totalOwed: number
}

export interface DebtPair {
  debtorId: string
  debtorName: string
  creditorId: string
  creditorName: string
  amount: number
}

/**
 * Calculate net position per family
 * netPosition > 0: family is owed money
 * netPosition < 0: family owes money
 */
export function calculateFamilyBalances(
  expenses: Expense[],
  families: Family[]
): FamilyBalance[] {
  const balances: Record<string, FamilyBalance> = {}

  // Initialize all families
  families.forEach(family => {
    balances[family.id] = {
      familyId: family.id,
      familyName: family.name,
      netPosition: 0,
      totalPaid: 0,
      totalOwed: 0,
    }
  })

  // Process each expense
  expenses.forEach(expense => {
    // Add to payer's "paid" amount
    if (balances[expense.payerFamilyId]) {
      balances[expense.payerFamilyId].totalPaid += expense.amount
    } else {
      throw new Error(`Unknown payer family ID: ${expense.payerFamilyId}`)
    }

    // Subtract each family's share from their net position
    Object.entries(expense.allocations).forEach(([familyId, amount]) => {
      if (balances[familyId]) {
        balances[familyId].totalOwed += amount
      } else {
        throw new Error(`Unknown allocation family ID: ${familyId}`)
      }
    })
  })

  // Calculate net positions
  Object.values(balances).forEach(balance => {
    balance.netPosition = balance.totalPaid - balance.totalOwed
  })

  return Object.values(balances)
}

/**
 * Convert net positions to pairwise debts
 * Phase 1: Simple proportional pairing with sum-preserving rounding
 */
export function calculateDebtPairs(balances: FamilyBalance[]): DebtPair[] {
  const creditors = balances.filter(b => b.netPosition > 0)
  const debtors = balances.filter(b => b.netPosition < 0)

  if (creditors.length === 0 || debtors.length === 0) {
    return []
  }

  const debts: DebtPair[] = []

  // Calculate total owed to all creditors
  const totalOwed = creditors.reduce((sum, c) => sum + c.netPosition, 0)

  // Each debtor pays each creditor proportionally
  debtors.forEach(debtor => {
    const debtorOwes = Math.abs(debtor.netPosition)
    const debtorDebts: DebtPair[] = []

    // Calculate amounts for this debtor
    creditors.forEach(creditor => {
      const creditorOwed = creditor.netPosition
      const proportion = creditorOwed / totalOwed
      const exactAmount = debtorOwes * proportion
      const roundedAmount = Math.round(exactAmount * 100) / 100

      debtorDebts.push({
        debtorId: debtor.familyId,
        debtorName: debtor.familyName,
        creditorId: creditor.familyId,
        creditorName: creditor.familyName,
        amount: roundedAmount,
      })
    })

    // Apply remainder distribution to preserve sum
    const totalRounded = debtorDebts.reduce((sum, d) => sum + d.amount, 0)
    const remainder = Math.round((debtorOwes - totalRounded) * 100)

    if (remainder !== 0) {
      // Add/subtract pennies to/from largest amounts (largest remainder method)
      const sortedDebts = [...debtorDebts].sort((a, b) => b.amount - a.amount)
      const increment = remainder > 0 ? 0.01 : -0.01
      const absRemainder = Math.abs(remainder)

      for (let i = 0; i < absRemainder && i < sortedDebts.length; i++) {
        sortedDebts[i].amount = Math.round((sortedDebts[i].amount + increment) * 100) / 100
      }
    }

    // Filter out tiny amounts and add to final list
    debtorDebts.forEach(debt => {
      if (debt.amount >= 0.01) {
        debts.push(debt)
      }
    })
  })

  return debts
}
