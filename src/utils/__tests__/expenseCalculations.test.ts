import { describe, it, expect } from 'vitest'
import { calculateFamilyBalances, calculateDebtPairs } from '../expenseCalculations'
import type { Expense, Family } from '@/types'

describe('calculateFamilyBalances', () => {
  const families: Family[] = [
    { id: 'f1', name: 'Smith', type: 'family' } as Family,
    { id: 'f2', name: 'Johnson', type: 'family' } as Family,
    { id: 'f3', name: 'Williams', type: 'family' } as Family,
  ]

  it('calculates net positions correctly for simple equal split', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        type: 'expense',
        title: 'Groceries',
        expenseDate: new Date('2026-05-01'),
        category: 'food',
        payerFamilyId: 'f1',
        amount: 120,
        allocationMode: 'equal',
        allocations: { f1: 40, f2: 40, f3: 40 },
        settled: false,
      } as Expense,
    ]

    const balances = calculateFamilyBalances(expenses, families)

    expect(balances).toEqual([
      { familyId: 'f1', familyName: 'Smith', netPosition: 80, totalPaid: 120, totalOwed: 40 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: -40, totalPaid: 0, totalOwed: 40 },
      { familyId: 'f3', familyName: 'Williams', netPosition: -40, totalPaid: 0, totalOwed: 40 },
    ])
  })

  it('handles multiple expenses with different payers', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        type: 'expense',
        payerFamilyId: 'f1',
        amount: 120,
        allocations: { f1: 40, f2: 40, f3: 40 },
      } as Expense,
      {
        id: 'e2',
        type: 'expense',
        payerFamilyId: 'f2',
        amount: 90,
        allocations: { f1: 30, f2: 30, f3: 30 },
      } as Expense,
    ]

    const balances = calculateFamilyBalances(expenses, families)

    const f1Balance = balances.find(b => b.familyId === 'f1')
    const f2Balance = balances.find(b => b.familyId === 'f2')
    const f3Balance = balances.find(b => b.familyId === 'f3')

    expect(f1Balance?.netPosition).toBe(50) // paid 120, owed 70
    expect(f1Balance?.totalPaid).toBe(120)
    expect(f1Balance?.totalOwed).toBe(70)

    expect(f2Balance?.netPosition).toBe(20) // paid 90, owed 70
    expect(f2Balance?.totalPaid).toBe(90)
    expect(f2Balance?.totalOwed).toBe(70)

    expect(f3Balance?.netPosition).toBe(-70) // paid 0, owed 70
    expect(f3Balance?.totalPaid).toBe(0)
    expect(f3Balance?.totalOwed).toBe(70)
  })

  it('returns empty array for empty expenses', () => {
    const expenses: Expense[] = []
    const balances = calculateFamilyBalances(expenses, families)

    expect(balances).toEqual([
      { familyId: 'f1', familyName: 'Smith', netPosition: 0, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: 0, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f3', familyName: 'Williams', netPosition: 0, totalPaid: 0, totalOwed: 0 },
    ])
  })

  it('returns empty array for empty families', () => {
    const expenses: Expense[] = []
    const balances = calculateFamilyBalances(expenses, [])

    expect(balances).toEqual([])
  })

  it('throws error for unknown payer family ID', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        type: 'expense',
        payerFamilyId: 'unknown',
        amount: 120,
        allocations: { f1: 120 },
      } as Expense,
    ]

    expect(() => calculateFamilyBalances(expenses, families)).toThrow(
      'Unknown payer family ID: unknown'
    )
  })

  it('throws error for unknown allocation family ID', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        type: 'expense',
        payerFamilyId: 'f1',
        amount: 120,
        allocations: { f1: 60, unknown: 60 },
      } as Expense,
    ]

    expect(() => calculateFamilyBalances(expenses, families)).toThrow(
      'Unknown allocation family ID: unknown'
    )
  })
})

describe('calculateDebtPairs', () => {
  it('creates correct debt pairs from balances', () => {
    const balances = [
      { familyId: 'f1', familyName: 'Smith', netPosition: 125, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: -75, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f3', familyName: 'Williams', netPosition: -50, totalPaid: 0, totalOwed: 0 },
    ]

    const debts = calculateDebtPairs(balances)

    expect(debts).toHaveLength(2)
    expect(debts).toContainEqual({
      debtorId: 'f2',
      debtorName: 'Johnson',
      creditorId: 'f1',
      creditorName: 'Smith',
      amount: 75,
    })
    expect(debts).toContainEqual({
      debtorId: 'f3',
      debtorName: 'Williams',
      creditorId: 'f1',
      creditorName: 'Smith',
      amount: 50,
    })
  })

  it('includes amounts at exactly $0.01', () => {
    const balances = [
      { familyId: 'f1', familyName: 'Smith', netPosition: 0.01, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: -0.01, totalPaid: 0, totalOwed: 0 },
    ]

    const debts = calculateDebtPairs(balances)

    expect(debts).toHaveLength(1)
    expect(debts[0].amount).toBe(0.01)
  })

  it('skips tiny amounts under $0.01', () => {
    const balances = [
      { familyId: 'f1', familyName: 'Smith', netPosition: 0.001, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: -0.001, totalPaid: 0, totalOwed: 0 },
    ]

    const debts = calculateDebtPairs(balances)

    expect(debts).toHaveLength(0)
  })

  it('preserves total amount with remainder distribution (rounding accumulation fix)', () => {
    const balances = [
      { familyId: 'f1', familyName: 'Smith', netPosition: 100, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: -33.33, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f3', familyName: 'Williams', netPosition: -33.33, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f4', familyName: 'Brown', netPosition: -33.34, totalPaid: 0, totalOwed: 0 },
    ]

    const debts = calculateDebtPairs(balances)

    // Sum of all debts should equal total owed (100)
    const totalDebts = debts.reduce((sum, d) => sum + d.amount, 0)
    expect(totalDebts).toBeCloseTo(100, 2)

    // Each debtor should pay their exact amount
    const debtsByDebtor = debts.reduce(
      (acc, d) => {
        acc[d.debtorId] = (acc[d.debtorId] || 0) + d.amount
        return acc
      },
      {} as Record<string, number>
    )

    expect(debtsByDebtor['f2']).toBeCloseTo(33.33, 2)
    expect(debtsByDebtor['f3']).toBeCloseTo(33.33, 2)
    expect(debtsByDebtor['f4']).toBeCloseTo(33.34, 2)
  })

  it('handles multi-creditor proportional splitting', () => {
    const balances = [
      { familyId: 'f1', familyName: 'Smith', netPosition: 60, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: 40, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f3', familyName: 'Williams', netPosition: -50, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f4', familyName: 'Brown', netPosition: -50, totalPaid: 0, totalOwed: 0 },
    ]

    const debts = calculateDebtPairs(balances)

    // Total creditors owed: 100 (60 + 40)
    // f1 gets 60% of each debtor's payment
    // f2 gets 40% of each debtor's payment

    // Each debtor owes 50
    // f3 pays: 30 to f1, 20 to f2
    // f4 pays: 30 to f1, 20 to f2

    expect(debts).toHaveLength(4)

    const f3ToF1 = debts.find(d => d.debtorId === 'f3' && d.creditorId === 'f1')
    const f3ToF2 = debts.find(d => d.debtorId === 'f3' && d.creditorId === 'f2')
    const f4ToF1 = debts.find(d => d.debtorId === 'f4' && d.creditorId === 'f1')
    const f4ToF2 = debts.find(d => d.debtorId === 'f4' && d.creditorId === 'f2')

    expect(f3ToF1?.amount).toBeCloseTo(30, 2)
    expect(f3ToF2?.amount).toBeCloseTo(20, 2)
    expect(f4ToF1?.amount).toBeCloseTo(30, 2)
    expect(f4ToF2?.amount).toBeCloseTo(20, 2)

    // Verify totals
    const totalDebts = debts.reduce((sum, d) => sum + d.amount, 0)
    expect(totalDebts).toBeCloseTo(100, 2)
  })

  it('returns empty array when no creditors', () => {
    const balances = [
      { familyId: 'f1', familyName: 'Smith', netPosition: -50, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: -50, totalPaid: 0, totalOwed: 0 },
    ]

    const debts = calculateDebtPairs(balances)
    expect(debts).toHaveLength(0)
  })

  it('returns empty array when no debtors', () => {
    const balances = [
      { familyId: 'f1', familyName: 'Smith', netPosition: 50, totalPaid: 0, totalOwed: 0 },
      { familyId: 'f2', familyName: 'Johnson', netPosition: 50, totalPaid: 0, totalOwed: 0 },
    ]

    const debts = calculateDebtPairs(balances)
    expect(debts).toHaveLength(0)
  })

  it('returns empty array for empty balances', () => {
    const balances: FamilyBalance[] = []
    const debts = calculateDebtPairs(balances)
    expect(debts).toHaveLength(0)
  })
})
