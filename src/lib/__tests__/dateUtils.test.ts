import { describe, it, expect } from 'vitest'
import { getDayName, calculateNights, isTimeInPeriod, TIME_PERIODS } from '../dateUtils'

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
})
