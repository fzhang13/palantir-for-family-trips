import { useCallback, useEffect, useRef, useState } from 'react'
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

export function useTimelineSimulation(doc: TripDocument): UseTimelineSimulationReturn {
  // Timeline state is now ephemeral (not persisted)
  const [cursorSlot, setCursorSlot] = useState<number>(doc.ui?.timeline?.cursorSlot || 0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playbackSpeed = 1

  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastTickRef = useRef<number>(Date.now())

  const play = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const jumpToCursor = useCallback((slot: number) => {
    const clamped = clampTimelineCursor(slot)
    setCursorSlot(clamped)
  }, [])

  const resetToLive = useCallback(() => {
    const liveCursor = getCurrentTripCursor(new Date())
    jumpToCursor(liveCursor)
  }, [jumpToCursor])

  const setPlaybackSpeedImpl = useCallback((_speed: number) => {
    // Playback speed not implemented in this version
  }, [])

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
        setCursorSlot((prev) => prev + 1)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying])

  return {
    cursorSlot,
    isPlaying,
    playbackSpeed,
    play,
    pause,
    jumpToCursor,
    resetToLive,
    setPlaybackSpeed: setPlaybackSpeedImpl,
  }
}
