import type { Expense, Family } from '@/types'

/**
 * Format amount as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse user input to currency amount
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Build equal expense allocations across families
 */
export function buildEqualExpenseAllocations(
  amount: number,
  families: Family[]
): Record<string, number> {
  const perFamily = amount / families.length
  const allocations: Record<string, number> = {}

  families.forEach((f) => {
    allocations[f.id] = Math.round(perFamily * 100) / 100
  })

  return allocations
}

/**
 * Get expense allocations (equal or custom)
 */
export function getExpenseAllocations(
  expense: Expense,
  families: Family[]
): Record<string, number> {
  if (expense.allocations && Object.keys(expense.allocations).length > 0) {
    return expense.allocations
  }
  return buildEqualExpenseAllocations(expense.amount, families)
}

/**
 * Calculate total expense burden per family
 */
export function getFamilyExpenseBurden(
  expenses: Expense[],
  families: Family[]
): Record<string, number> {
  const burdens: Record<string, number> = {}

  families.forEach((f) => {
    burdens[f.id] = 0
  })

  expenses.forEach((expense) => {
    const allocations = getExpenseAllocations(expense, families)
    Object.entries(allocations).forEach(([familyId, amount]) => {
      burdens[familyId] = (burdens[familyId] || 0) + amount
    })
  })

  return burdens
}

/**
 * Build manual allocation seed for custom splitting
 */
export function buildManualAllocationSeed(
  families: Family[]
): Record<string, number> {
  const allocations: Record<string, number> = {}

  families.forEach((f) => {
    allocations[f.id] = 0
  })

  return allocations
}
