export const TIME_PERIODS = {
  morning: { start: '06:00', end: '12:00' },
  afternoon: { start: '12:00', end: '18:00' },
  evening: { start: '18:00', end: '23:00' },
} as const

export type TimePeriod = keyof typeof TIME_PERIODS

/**
 * Get day name from date
 */
export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Calculate number of nights between check-in and check-out
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const diffMs = checkOut.getTime() - checkIn.getTime()
  return Math.floor(diffMs / msPerDay)
}

/**
 * Check if a time falls within a given period
 */
export function isTimeInPeriod(time: string, period: TimePeriod): boolean {
  const { start, end } = TIME_PERIODS[period]
  return time >= start && time < end
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Parse ISO date string to Date object
 */
export function parseDateISO(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/**
 * Generate an array of dates between start and end (inclusive)
 */
export function generateDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)

  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

/**
 * Format date as "Thursday, May 8, 2026"
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
