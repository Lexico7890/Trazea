// src/components/GlobalErrorBoundary.tsx
import * as Sentry from "@sentry/react";
import type { ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";

interface GlobalErrorBoundaryProps {
    children: ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
    return (
        // Usamos el ErrorBoundary nativo de Sentry
        <Sentry.ErrorBoundary
            fallback={ErrorFallback}
            onReset={() => {
                window.location.reload();
            }}
        >
            {children}
        </Sentry.ErrorBoundary>
    );
}