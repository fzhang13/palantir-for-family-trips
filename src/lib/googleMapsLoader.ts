import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { env } from '@/lib/env'

let optionsInitialized = false

export function initGoogleMapsOptions() {
  if (optionsInitialized) return
  if (!env.googleMapsApiKey) return

  setOptions({
    key: env.googleMapsApiKey,
    v: 'weekly',
    libraries: ['places'],
  })

  optionsInitialized = true
}

export { importLibrary }
