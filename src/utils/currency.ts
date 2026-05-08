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
 * Uses largest-remainder distribution to ensure sum equals original amount
 */
export function buildEqualExpenseAllocations(
  amount: number,
  familyIds: string[]
): Record<string, number> {
  if (familyIds.length === 0) {
    return {}
  }

  const perFamily = amount / familyIds.length
  const allocations: Record<string, number> = {}

  // Initial rounding
  familyIds.forEach(id => {
    allocations[id] = Math.round(perFamily * 100) / 100
  })

  // Apply remainder distribution to preserve sum
  const totalRounded = Object.values(allocations).reduce((sum, val) => sum + val, 0)
  const remainder = Math.round((amount - totalRounded) * 100)

  if (remainder !== 0) {
    // Sort families by allocation amount (descending) for stable distribution
    const sortedIds = [...familyIds].sort((a, b) => allocations[b] - allocations[a])
    const increment = remainder > 0 ? 0.01 : -0.01
    const absRemainder = Math.abs(remainder)

    // Distribute pennies to largest amounts
    for (let i = 0; i < absRemainder && i < sortedIds.length; i++) {
      allocations[sortedIds[i]] = Math.round((allocations[sortedIds[i]] + increment) * 100) / 100
    }
  }

  return allocations
}

/**
 * Validate expense allocations
 */
export function validateAllocations(
  amount: number,
  allocations: Record<string, number>,
  payerFamilyId: string
): { valid: boolean; error?: string } {
  const familyIds = Object.keys(allocations)

  // At least one family
  if (familyIds.length === 0) {
    return { valid: false, error: 'At least one family must be selected' }
  }

  // Check for negative allocations
  const hasNegative = Object.values(allocations).some(val => val < 0)
  if (hasNegative) {
    return { valid: false, error: 'Allocation amounts cannot be negative' }
  }

  // Payer must be included
  if (!(payerFamilyId in allocations)) {
    return { valid: false, error: 'Payer must be included in allocations' }
  }

  // Payer allocation must be greater than zero
  if (allocations[payerFamilyId] === 0) {
    return { valid: false, error: 'Payer allocation must be greater than zero' }
  }

  // Sum must match amount
  const sum = Object.values(allocations).reduce((a, b) => a + b, 0)
  const diff = Math.abs(sum - amount)

  if (diff > 0.01) {
    return {
      valid: false,
      error: `Allocations ($${sum.toFixed(2)}) must equal total amount ($${amount.toFixed(2)})`,
    }
  }

  return { valid: true }
}
