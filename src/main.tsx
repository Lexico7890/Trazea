if (typeof window !== 'undefined' && window.location.hash) {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const googleRefreshToken = hashParams.get('provider_refresh_token');

  if (googleRefreshToken) {
    localStorage.setItem('temp_google_refresh_token', googleRefreshToken);
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GlobalErrorBoundary, initSentry } from './app'
import { queryClient } from './shared/lib'
import App from './app/ui/App'
import './app/styles/index.css'
import './app/styles/App.css';

// Initialize Sentry before rendering
initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)