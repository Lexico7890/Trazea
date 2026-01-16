import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import type { Repuesto } from "@/entities/repuestos";
import { ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    repuesto: Repuesto | null;
}

export function ImagePreviewModal({ isOpen, onClose, repuesto }: ImagePreviewModalProps) {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        // Reset image error state when repuesto changes or modal opens
        if (isOpen) {
            setImageError(false);
        }
    }, [isOpen, repuesto]);


    if (!repuesto) {
        return null;
    }

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Referencia: {repuesto.referencia}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    {imageError || !repuesto.url_imagen ? (
                        <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md">
                            <ImageIcon className="w-16 h-16 text-muted-foreground" />
                        </div>
                    ) : (
                        <img
                            src={repuesto.url_imagen}
                            alt={`Imagen de ${repuesto.nombre}`}
                            className="max-w-full max-h-96 object-contain rounded-md"
                            onError={handleImageError}
                        />
                    )}
                    <p className="mt-4 text-center font-medium">{repuesto.nombre}</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
