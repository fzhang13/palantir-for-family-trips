function getEnvVar(key: string): string | undefined {
  return import.meta.env[key]
}

export const env = {
  googleMapsApiKey: getEnvVar('VITE_GOOGLE_MAPS_API_KEY'),
  googleMapId: getEnvVar('VITE_GOOGLE_MAP_ID'),
  disableLegacyGoogleRouting: getEnvVar('VITE_DISABLE_LEGACY_GOOGLE_ROUTING') === 'true',
  supabaseUrl: getEnvVar('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
