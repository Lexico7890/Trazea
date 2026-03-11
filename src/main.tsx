// 🔥 TRAMPA DE HASH (ANTES DE QUE ARRANQUE REACT Y SUPABASE) 🔥
if (typeof window !== 'undefined' && window.location.hash) {
  console.log("🚨 [TRAMPA] URL original recibida de Supabase");

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const googleRefreshToken = hashParams.get('provider_refresh_token');
  const googleAccessToken = hashParams.get('provider_token');

  if (googleRefreshToken) {
    console.log("🎉 [TRAMPA] ¡Refresh Token de Google atrapado en el aire!", googleRefreshToken.substring(0, 15) + "...");
    localStorage.setItem('temp_google_refresh_token', googleRefreshToken);
  } else if (googleAccessToken) {
    console.log("⚠️ [TRAMPA] Google envió el access_token normal, PERO NO envió el refresh_token.");
    console.log("Esto significa que debes ir a tu cuenta de Google y revocar el acceso de la app para forzarlo.");
  }
}
// 🔥 FIN DE LA TRAMPA 🔥

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