import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorFallbackProps {
    error: unknown;
    componentStack: string;
    eventId: string;
    resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-foreground">
            <div className="flex flex-col items-center gap-2 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Algo salió mal</h1>
                <p className="max-w-[500px] text-muted-foreground">
                    Ha ocurrido un error inesperado. Hemos notificado al equipo técnico.
                    Por favor, intenta recargar la página.
                </p>
            </div>

            {import.meta.env.DEV && (
                <div className="mt-4 w-full max-w-[600px] rounded-md bg-muted p-4 overflow-auto max-h-[200px] text-xs font-mono">
                    <p className="font-bold text-destructive mb-2">
                        {error instanceof Error ? error.message : String(error)}
                    </p>
                    <pre>{error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            <Button onClick={resetError} variant="default" className="mt-4">
                Intentar de nuevo
            </Button>
        </div>
    );
}
