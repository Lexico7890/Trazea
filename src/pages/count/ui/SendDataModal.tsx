import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';

interface SendDataModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    totalItemsAuditados: number;
    totalDiferenciaEncontrada: number;
    totalItemsPq: number;
    observaciones: string;
    onObservacionesChange: (value: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export function SendDataModal({
    isOpen,
    isSubmitting,
    totalItemsAuditados,
    totalDiferenciaEncontrada,
    totalItemsPq,
    observaciones,
    onObservacionesChange,
    onClose,
    onConfirm,
}: SendDataModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Confirmar Envío de Conteo</DialogTitle>
                    <DialogDescription>
                        Está a punto de enviar los resultados del conteo. Puede agregar observaciones opcionales.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            <strong>Total de items auditados:</strong> {totalItemsAuditados}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong>Total de diferencias encontradas:</strong> {totalDiferenciaEncontrada}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong>Total de items PQ:</strong> {totalItemsPq}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="observaciones" className="text-sm font-medium">
                            Observaciones (opcional)
                        </label>
                        <Textarea
                            id="observaciones"
                            placeholder="Ingrese observaciones sobre el conteo..."
                            value={observaciones}
                            onChange={(e) => onObservacionesChange(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Confirmar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
