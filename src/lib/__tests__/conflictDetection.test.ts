// src/lib/__tests__/conflictDetection.test.ts
import { describe, it, expect } from 'vitest'
import { checkMealConflicts, checkActivityConflicts } from '../conflictDetection'
import type { Meal, Activity } from '@/types/trip'

describe('conflictDetection', () => {
  describe('checkMealConflicts', () => {
    it('detects same meal type on same date', () => {
      const existingMeals: Meal[] = [
        {
          id: '1',
          type: 'meal',
          title: "Joe's Diner",
          mealDate: '2026-05-15',
          mealType: 'lunch',
          status: 'Confirmed',
          dayId: 'thu',
          startSlot: 0,
        },
      ]

      const result = checkMealConflicts(existingMeals, '2026-05-15', 'lunch')

      expect(result.hasConflict).toBe(true)
      expect(result.conflicts[0]).toMatchObject({
        type: 'meal',
        title: "Joe's Diner",
      })
    })

    it('allows different meal types on same date', () => {
      const existingMeals: Meal[] = [
        {
          id: '1',
          type: 'meal',
          title: 'Breakfast Place',
          mealDate: '2026-05-15',
          mealType: 'breakfast',
          status: 'Confirmed',
          dayId: 'thu',
          startSlot: 0,
        },
      ]

      const result = checkMealConflicts(existingMeals, '2026-05-15', 'lunch')

      expect(result.hasConflict).toBe(false)
    })

    it('excludes specified meal ID', () => {
      const existingMeals: Meal[] = [
        {
          id: '1',
          type: 'meal',
          title: "Joe's Diner",
          mealDate: '2026-05-15',
          mealType: 'lunch',
          status: 'Confirmed',
          dayId: 'thu',
          startSlot: 0,
        },
      ]

      const result = checkMealConflicts(
        existingMeals,
        '2026-05-15',
        'lunch',
        '1' // Exclude self
      )

      expect(result.hasConflict).toBe(false)
    })
  })

  describe('checkActivityConflicts', () => {
    it('detects overlapping time ranges', () => {
      const existingActivities: Activity[] = [
        {
          id: '1',
          type: 'activity',
          title: 'Museum Tour',
          activityDate: '2026-05-15',
          timePeriod: 'afternoon',
          startTime: '13:00',
          endTime: '15:00',
          status: 'Go',
          riskLevel: 'low',
          weatherSensitivity: '',
          dayId: 'thu',
        },
      ]

      const result = checkActivityConflicts(existingActivities, '2026-05-15', '14:00', '16:00')

      expect(result.hasConflict).toBe(true)
      expect(result.conflicts[0]).toMatchObject({
        type: 'activity',
        title: 'Museum Tour',
      })
    })

    it('allows non-overlapping times', () => {
      const existingActivities: Activity[] = [
        {
          id: '1',
          type: 'activity',
          title: 'Morning Hike',
          activityDate: '2026-05-15',
          timePeriod: 'morning',
          startTime: '08:00',
          endTime: '11:00',
          status: 'Go',
          riskLevel: 'low',
          weatherSensitivity: '',
          dayId: 'thu',
        },
      ]

      const result = checkActivityConflicts(existingActivities, '2026-05-15', '14:00', '16:00')

      expect(result.hasConflict).toBe(false)
    })

    it('excludes specified activity ID', () => {
      const existingActivities: Activity[] = [
        {
          id: '1',
          type: 'activity',
          title: 'Museum Tour',
          activityDate: '2026-05-15',
          timePeriod: 'afternoon',
          startTime: '13:00',
          endTime: '15:00',
          status: 'Go',
          riskLevel: 'low',
          weatherSensitivity: '',
          dayId: 'thu',
        },
      ]

      const result = checkActivityConflicts(
        existingActivities,
        '2026-05-15',
        '14:00',
        '16:00',
        '1' // Exclude self
      )

      expect(result.hasConflict).toBe(false)
    })
  })
})
