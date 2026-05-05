interface PublishConfig {
  visibilityMode: 'public' | 'private'
  liveExternalData: boolean
}

export const PUBLISH_CONFIG: PublishConfig = {
  visibilityMode: 'public',
  liveExternalData: true,
}

export function isPublicMode(): boolean {
  return PUBLISH_CONFIG.visibilityMode === 'public'
}

export function isLiveExternalDataEnabled(): boolean {
  return PUBLISH_CONFIG.liveExternalData !== false
}
