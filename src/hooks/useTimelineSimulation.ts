import { useCallback, useEffect, useRef } from 'react'
import type { TripDocument } from '@/types'
import { clampTimelineCursor, getCurrentTripCursor } from '@/utils/timeline'

interface UseTimelineSimulationReturn {
  cursorSlot: number
  isPlaying: boolean
  playbackSpeed: number
  play: () => void
  pause: () => void
  jumpToCursor: (slot: number) => void
  resetToLive: () => void
  setPlaybackSpeed: (speed: number) => void
}

export function useTimelineSimulation(
  doc: TripDocument,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseTimelineSimulationReturn {
  const cursorSlot = doc.ui.timeline.cursorSlot
  const isPlaying = doc.ui.timeline.mode === 'scenario'
  const playbackSpeed = 1

  // Suppress unused warning - used in effect below
  void playbackSpeed

  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastTickRef = useRef<number>(Date.now())

  const play = useCallback(() => {
    onUpdateDoc((doc) => ({
      ...doc,
      ui: {
        ...doc.ui,
        timeline: {
          ...doc.ui.timeline,
          mode: 'scenario',
        },
      },
    }))
  }, [onUpdateDoc])

  const pause = useCallback(() => {
    onUpdateDoc((doc) => ({
      ...doc,
      ui: {
        ...doc.ui,
        timeline: {
          ...doc.ui.timeline,
          mode: 'reality',
        },
      },
    }))
  }, [onUpdateDoc])

  const jumpToCursor = useCallback(
    (slot: number) => {
      const clamped = clampTimelineCursor(slot)
      onUpdateDoc((doc) => ({
        ...doc,
        ui: {
          ...doc.ui,
          timeline: {
            ...doc.ui.timeline,
            cursorSlot: clamped,
          },
        },
      }))
    },
    [onUpdateDoc]
  )

  const resetToLive = useCallback(() => {
    const liveCursor = getCurrentTripCursor(new Date())
    jumpToCursor(liveCursor)
  }, [jumpToCursor])

  const setPlaybackSpeed = useCallback(
    (_speed: number) => {
      // Playback speed not implemented in this version
    },
    []
  )

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const animate = () => {
      const now = Date.now()
      const delta = now - lastTickRef.current

      // Advance cursor based on playback speed (4 slots per second)
      if (delta > 250) {
        lastTickRef.current = now
        onUpdateDoc((doc) => ({
          ...doc,
          ui: {
            ...doc.ui,
            timeline: {
              ...doc.ui.timeline,
              cursorSlot: doc.ui.timeline.cursorSlot + 1,
            },
          },
        }))
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, onUpdateDoc])

  return {
    cursorSlot,
    isPlaying,
    playbackSpeed,
    play,
    pause,
    jumpToCursor,
    resetToLive,
    setPlaybackSpeed,
  }
}
