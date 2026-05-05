import { useCallback, useMemo } from 'react'
import type { TripDocument, Entity, EntitySelection, PageType } from '@/types'
import { getEntityById, getEntityBySelection } from '@/models/tripModel'

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
  _currentPage: PageType,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseTripSelectionReturn {
  const selection = doc.selection

  const selectedEntity = useMemo(() => {
    return getEntityBySelection(doc, selection)
  }, [doc, selection])

  const selectEntity = useCallback(
    (entityType: string, entityId: string) => {
      onUpdateDoc((doc) => ({
        ...doc,
        selection: { type: entityType, id: entityId },
      }))
    },
    [onUpdateDoc]
  )

  const selectEntityByRef = useCallback(
    (entity: Entity) => {
      selectEntity(entity.type, entity.id)
    },
    [selectEntity]
  )

  const clearSelection = useCallback(() => {
    onUpdateDoc((doc) => ({
      ...doc,
      selection: null,
    }))
  }, [onUpdateDoc])

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
