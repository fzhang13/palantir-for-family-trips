import { useState, useEffect } from 'react'
import type { TripDocument } from '@/types'
import {
  getInitialTripDocument,
  clearLegacyTripStorage,
  TRIP_DOCUMENT_STORAGE_KEY,
} from '@/models/tripModel'

export function usePersistedTripState(): [
  TripDocument,
  (updater: (doc: TripDocument) => TripDocument) => void
] {
  const [doc, setDoc] = useState<TripDocument>(() => {
    clearLegacyTripStorage()

    const stored = localStorage.getItem(TRIP_DOCUMENT_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as TripDocument
      } catch {
        // Failed to parse stored data, return initial document
      }
    }

    return getInitialTripDocument()
  })

  useEffect(() => {
    localStorage.setItem(TRIP_DOCUMENT_STORAGE_KEY, JSON.stringify(doc))
  }, [doc])

  const updateDoc = (updater: (doc: TripDocument) => TripDocument) => {
    setDoc((current) => updater(current))
  }

  return [doc, updateDoc]
}
