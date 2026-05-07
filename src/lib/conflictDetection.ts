// src/lib/conflictDetection.ts
import type { Meal, Activity } from '@/types/trip'

export interface ConflictCheck {
  hasConflict: boolean
  conflicts: Array<{
    type: 'meal' | 'activity'
    title: string
    time: string
    suggestion?: string
  }>
}

/**
 * Check if two time ranges overlap
 */
function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && end1 > start2
}

/**
 * Format time for display
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${period}`
}

/**
 * Check for meal conflicts on the same date with same meal type
 */
export function checkMealConflicts(
  existingMeals: Meal[],
  mealDate: string,
  mealType: string,
  excludeId?: string
): ConflictCheck {
  const conflicts = existingMeals
    .filter((meal) => {
      if (meal.id === excludeId) return false
      if (meal.mealDate !== mealDate) return false
      if (meal.mealType !== mealType) return false
      return true
    })
    .map((meal) => ({
      type: 'meal' as const,
      title: meal.title,
      time: mealType,
    }))

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  }
}

/**
 * Check for activity time conflicts on the same date
 */
export function checkActivityConflicts(
  existingActivities: Activity[],
  activityDate: string,
  startTime?: string,
  endTime?: string,
  excludeId?: string
): ConflictCheck {
  // If no specific time range, can't detect conflicts
  if (!startTime || !endTime) {
    return { hasConflict: false, conflicts: [] }
  }

  const conflicts = existingActivities
    .filter((activity) => {
      if (activity.id === excludeId) return false
      if (activity.activityDate !== activityDate) return false
      if (!activity.startTime || !activity.endTime) return false

      return timesOverlap(
        startTime,
        endTime,
        activity.startTime,
        activity.endTime
      )
    })
    .map((activity) => ({
      type: 'activity' as const,
      title: activity.title,
      time: `${formatTime(activity.startTime!)} - ${formatTime(activity.endTime!)}`,
    }))

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  }
}
