import type { Entity } from '@/types'

/**
 * Format list of names with commas and "and"
 */
export function formatNameList(labels: string[]): string {
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`

  const last = labels[labels.length - 1]
  const rest = labels.slice(0, -1)
  return `${rest.join(', ')}, and ${last}`
}

/**
 * Strip "Day N: " prefix from labels
 */
export function stripDayPrefix(label: string): string {
  return label.replace(/^Day \d+:\s*/, '')
}

/**
 * Deduplicate array by id property
 */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      result.push(item)
    }
  }

  return result
}

/**
 * Pick most frequent entity from list
 */
export function pickMostFrequentEntity(items: Entity[]): Entity | null {
  if (items.length === 0) return null
  if (items.length === 1) return items[0]

  const counts = new Map<string, number>()

  items.forEach(item => {
    const key = `${item.type}:${item.id}`
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  let maxCount = 0
  let mostFrequent: Entity | null = null

  items.forEach(item => {
    const key = `${item.type}:${item.id}`
    const count = counts.get(key) || 0
    if (count > maxCount) {
      maxCount = count
      mostFrequent = item
    }
  })

  return mostFrequent
}
