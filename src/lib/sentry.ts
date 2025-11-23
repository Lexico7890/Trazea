import * as Sentry from "@sentry/react";

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN, // Add your Sentry DSN to .env
    integrations: [
      // Use the new browserTracingIntegration instead of reactRouterV6BrowserTracing
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Adjust in production
    // Session Replay
    replaysSessionSampleRate: 0.1, // Adjust based on your needs
    replaysOnErrorSampleRate: 1.0,
    // Environment
    environment: import.meta.env.MODE,
  });
}
