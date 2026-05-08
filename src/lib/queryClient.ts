import { QueryClient } from '@tanstack/react-query'

const QUERY_STALE_TIME_MS = 5 * 60 * 1000 // 5 minutes
const QUERY_GC_TIME_MS = 10 * 60 * 1000 // 10 minutes
const QUERY_RETRY_COUNT = 3
const QUERY_BASE_RETRY_DELAY_MS = 1000
const QUERY_MAX_RETRY_DELAY_MS = 30000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: QUERY_GC_TIME_MS,
      retry: QUERY_RETRY_COUNT,
      retryDelay: attemptIndex =>
        Math.min(QUERY_BASE_RETRY_DELAY_MS * 2 ** attemptIndex, QUERY_MAX_RETRY_DELAY_MS),
    },
    mutations: {
      retry: QUERY_RETRY_COUNT,
    },
  },
})
