import type { TripDocument } from '@/types'

// Constants (will import from tripData later)
const TIME_SLOTS_PER_HOUR = 4
const HOURS_PER_DAY = 24
const SLOTS_PER_DAY = TIME_SLOTS_PER_HOUR * HOURS_PER_DAY

/**
 * Clamp cursor to valid timeline range
 */
export function clampTimelineCursor(slot: number): number {
  return Math.max(0, slot)
}

/**
 * Get visible cursor range for a given day
 */
export function getDayVisibleCursorRange(dayIndex: number): [number, number] {
  const startSlot = dayIndex * SLOTS_PER_DAY
  const endSlot = startSlot + SLOTS_PER_DAY - 1
  return [startSlot, endSlot]
}

/**
 * Project cursor to visible timeline ratio (0-1)
 */
export function projectCursorToVisibleTimelineRatio(
  cursorSlot: number,
  dayCount = 4
): number {
  const totalSlots = dayCount * SLOTS_PER_DAY
  return Math.min(1, Math.max(0, cursorSlot / totalSlots))
}

/**
 * Project visible ratio back to cursor slot
 */
export function projectVisibleTimelineRatioToCursor(
  ratio: number,
  dayCount = 4
): number {
  const totalSlots = dayCount * SLOTS_PER_DAY
  return Math.round(ratio * totalSlots)
}

/**
 * Get hour-in-day for cursor (0-23)
 */
export function getCursorHourInDay(cursorSlot: number): number {
  const slotInDay = cursorSlot % SLOTS_PER_DAY
  return Math.floor(slotInDay / TIME_SLOTS_PER_HOUR)
}

/**
 * Get day index for cursor
 */
export function getCursorDay(cursorSlot: number): number {
  return Math.floor(cursorSlot / SLOTS_PER_DAY)
}

/**
 * Get mission launch cursor for day (8am)
 */
export function getMissionLaunchCursor(dayIndex: number): number {
  return dayIndex * SLOTS_PER_DAY + 8 * TIME_SLOTS_PER_HOUR
}

/**
 * Get suggested playback start cursor
 */
export function getSuggestedPlaybackStartCursor(
  doc: TripDocument,
  cursorSlot: number,
  operationCheckpoint?: number
): number {
  if (operationCheckpoint !== undefined && cursorSlot >= operationCheckpoint) {
    return cursorSlot
  }

  // Find earliest active route
  const routes = doc.routes || []
  if (routes.length > 0) {
    return 0 // Start at beginning if routes exist
  }

  return cursorSlot
}

/**
 * Get current trip cursor based on real time
 */
export function getCurrentTripCursor(now: Date = new Date()): number {
  // This is a simplified version - actual implementation would calculate
  // based on trip start date and current time
  const hour = now.getHours()
  const minutes = now.getMinutes()
  const slotInDay = Math.floor((hour * 60 + minutes) / 15)
  return slotInDay
}

/**
 * Get compact travel label for itinerary item
 */
export function getCompactTravelLabel(item: any): string {
  if (!item) return ''
  
  // Extract origin and destination from label
  const match = item.label?.match(/(.+?)\s*→\s*(.+)/)
  if (match) {
    const [, origin, dest] = match
    return `${origin.trim()} → ${dest.trim()}`
  }
  
  return item.label || ''
}
