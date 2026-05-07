import { describe, it, expect } from 'vitest'
import {
  getDayName,
  calculateNights,
  isTimeInPeriod,
  TIME_PERIODS,
  generateDaysInRange,
  formatFullDate,
} from '../dateUtils'

describe('dateUtils', () => {
  describe('getDayName', () => {
    it('returns correct day name for date', () => {
      const date = new Date('2026-05-15') // Thursday
      expect(getDayName(date)).toBe('Thursday')
    })
  })

  describe('calculateNights', () => {
    it('calculates nights between dates', () => {
      const checkIn = new Date('2026-05-15')
      const checkOut = new Date('2026-05-18')
      expect(calculateNights(checkIn, checkOut)).toBe(3)
    })

    it('returns 0 for same day', () => {
      const date = new Date('2026-05-15')
      expect(calculateNights(date, date)).toBe(0)
    })
  })

  describe('isTimeInPeriod', () => {
    it('validates morning times', () => {
      expect(isTimeInPeriod('08:00', 'morning')).toBe(true)
      expect(isTimeInPeriod('13:00', 'morning')).toBe(false)
    })

    it('validates afternoon times', () => {
      expect(isTimeInPeriod('14:00', 'afternoon')).toBe(true)
      expect(isTimeInPeriod('08:00', 'afternoon')).toBe(false)
    })

    it('validates evening times', () => {
      expect(isTimeInPeriod('19:00', 'evening')).toBe(true)
      expect(isTimeInPeriod('14:00', 'evening')).toBe(false)
    })
  })

  describe('TIME_PERIODS', () => {
    it('defines correct period boundaries', () => {
      expect(TIME_PERIODS.morning).toEqual({ start: '06:00', end: '12:00' })
      expect(TIME_PERIODS.afternoon).toEqual({ start: '12:00', end: '18:00' })
      expect(TIME_PERIODS.evening).toEqual({ start: '18:00', end: '23:00' })
    })
  })

  describe('generateDaysInRange', () => {
    it('generates array of dates between start and end (inclusive)', () => {
      const start = new Date('2026-05-08')
      const end = new Date('2026-05-10')
      const result = generateDaysInRange(start, end)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(new Date('2026-05-08'))
      expect(result[1]).toEqual(new Date('2026-05-09'))
      expect(result[2]).toEqual(new Date('2026-05-10'))
    })

    it('returns single date when start equals end', () => {
      const date = new Date('2026-05-08')
      const result = generateDaysInRange(date, date)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(new Date('2026-05-08'))
    })

    it('handles month boundaries correctly', () => {
      const start = new Date('2026-04-30')
      const end = new Date('2026-05-02')
      const result = generateDaysInRange(start, end)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(new Date('2026-04-30'))
      expect(result[1]).toEqual(new Date('2026-05-01'))
      expect(result[2]).toEqual(new Date('2026-05-02'))
    })
  })

  describe('formatFullDate', () => {
    it('formats date as "Thursday, May 8, 2026"', () => {
      const date = new Date('2026-05-08')
      const result = formatFullDate(date)

      expect(result).toBe('Friday, May 8, 2026')
    })

    it('formats different dates correctly', () => {
      const date1 = new Date('2026-01-01')
      const date2 = new Date('2026-12-25')

      expect(formatFullDate(date1)).toBe('Thursday, January 1, 2026')
      expect(formatFullDate(date2)).toBe('Friday, December 25, 2026')
    })
  })
})
