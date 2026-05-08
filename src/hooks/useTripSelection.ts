import { useCallback, useMemo, useState } from 'react'
import type { TripDocument, Entity, EntitySelection, PageType } from '@/types'
import { getEntityById, getEntityBySelection } from '@/utils/trip'

interface UseTripSelectionReturn {
  selection: EntitySelection | null
  selectedEntity: Entity | null
  selectEntity: (entityType: string, entityId: string) => void
  selectEntityByRef: (entity: Entity) => void
  clearSelection: () => void
  canSelectEntity: (entityType: string, entityId: string) => boolean
}

export function useTripSelection(
  doc: TripDocument,
  _currentPage: PageType
): UseTripSelectionReturn {
  // Selection is now ephemeral React state (not persisted)
  const [selection, setSelection] = useState<EntitySelection | null>(doc.selection || null)

  const selectedEntity = useMemo(() => {
    return getEntityBySelection(doc, selection)
  }, [doc, selection])

  const selectEntity = useCallback((entityType: string, entityId: string) => {
    setSelection({ type: entityType, id: entityId })
  }, [])

  const selectEntityByRef = useCallback(
    (entity: Entity) => {
      selectEntity(entity.type, entity.id)
    },
    [selectEntity]
  )

  const clearSelection = useCallback(() => {
    setSelection(null)
  }, [])

  const canSelectEntity = useCallback(
    (entityType: string, entityId: string) => {
      const entity = getEntityById(doc, entityType, entityId)
      return entity !== null
    },
    [doc]
  )

  return {
    selection,
    selectedEntity,
    selectEntity,
    selectEntityByRef,
    clearSelection,
    canSelectEntity,
  }
}
