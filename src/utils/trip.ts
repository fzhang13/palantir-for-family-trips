import type { Entity, Family, TripDocument, ItineraryItem } from '@/types'

/**
 * Add family metadata to entity
 */
export function stampFamilyMetadata<T extends Entity>(
  item: T,
  familyId: string
): T {
  return {
    ...item,
    familyId,
  } as T
}

/**
 * Get display label for family
 */
export function getFamilyLabel(families: Family[], familyId: string): string {
  const family = families.find((f) => f.id === familyId)
  return family?.name || familyId
}

/**
 * Make entity key from type and id
 */
export function makeEntityKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`
}

/**
 * Parse entity key into type and id
 */
export function parseEntityKey(key: string): { type: string; id: string } {
  const [type, id] = key.split(':')
  return { type, id }
}

/**
 * Get related travel items for mission gate
 */
export function getRelatedTravelItemsForGate(
  doc: TripDocument,
  gate: ItineraryItem
): ItineraryItem[] {
  if (!gate) return []

  const gateSlot = gate.startSlot
  const windowSlots = 4 * 4 // 4 hours in 15-minute slots

  return doc.itineraryItems.filter((item) => {
    if (!item.routeId) return false

    const slotDiff = Math.abs(item.startSlot - gateSlot)

    return slotDiff <= windowSlots
  })
}

/**
 * Build operation gate context for mission launch
 */
export function buildOperationGateContext(
  doc: TripDocument,
  gate: ItineraryItem
): any {
  const relatedTravel = getRelatedTravelItemsForGate(doc, gate)
  const relatedRouteIds = relatedTravel
    .map((t) => t.routeId)
    .filter((id): id is string => !!id)

  const relatedRoutes = doc.routes.filter((r) =>
    relatedRouteIds.includes(r.id)
  )

  const estimatedArrivals = relatedRoutes.map((r) => {
    // Simplified - actual implementation would calculate ETA
    return r.title
  })

  const readinessStatus = relatedRoutes.length > 0 ? 'ready' : 'pending'

  return {
    gate,
    relatedRoutes,
    estimatedArrivals,
    readinessStatus,
  }
}
