import type { Entity, Family, TripDocument, ItineraryItem, EntitySelection } from '@/types'

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
 * Map entity type to collection name in TripDocument
 */
export const COLLECTION_BY_TYPE: Record<string, string> = {
  family: 'families',
  location: 'locations',
  route: 'routes',
  itineraryItem: 'itineraryItems',
  meal: 'meals',
  activity: 'activities',
  stayItem: 'stayItems',
  expense: 'expenses',
  task: 'tasks',
}

/**
 * Get collection from TripDocument by entity type
 */
export function getCollection(doc: TripDocument, type: string): any[] {
  const collectionName = COLLECTION_BY_TYPE[type]
  if (!collectionName) return []
  return (doc[collectionName as keyof TripDocument] as any) || []
}

/**
 * Get entity by type and id from TripDocument
 */
export function getEntityById(doc: TripDocument, type: string, id: string): any | null {
  return getCollection(doc, type).find((item: any) => item.id === id) || null
}

/**
 * Get entity by selection from TripDocument
 */
export function getEntityBySelection(doc: TripDocument, selection: EntitySelection | null): any | null {
  if (!selection?.type || !selection?.id) return null
  return getEntityById(doc, selection.type, selection.id)
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

  return {
    gate,
    relatedRoutes,
    estimatedArrivals,
  }
}
