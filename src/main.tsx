import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { queryClient } from './lib/queryClient'
import { DESIGN_COLORS, TONE_COLORS } from './lib/constants'
import { ActiveTripProvider } from '@/context'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ActiveTripProvider>
        <App />
      </ActiveTripProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: DESIGN_COLORS.surface,
            color: DESIGN_COLORS.textPrimary,
            border: `1px solid ${DESIGN_COLORS.border}`,
          },
          success: {
            iconTheme: {
              primary: TONE_COLORS.success,
              secondary: DESIGN_COLORS.surface,
            },
          },
          error: {
            iconTheme: {
              primary: TONE_COLORS.critical,
              secondary: DESIGN_COLORS.surface,
            },
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
)
