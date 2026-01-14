import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { useUserStore } from "@/entities/user";
import { fetchUserSessionData, supabase } from "@/shared/api";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";

export function NoRoleModal() {
    const { sessionData, setSessionData, currentLocation } = useUserStore();
    const [isValidating, setIsValidating] = useState(false);

    // Determinar si debemos mostrar el modal
    // Solo si está autenticado, tiene ubicación seleccionada, pero NO tiene rol (o el rol es inválido/vacío)
    const shouldShow =
        !!sessionData?.user &&
        !!currentLocation &&
        (!sessionData.user.role || !sessionData.user.role.nombre);

    const handleValidateRole = async () => {
        setIsValidating(true);
        try {
            // Obtener el usuario actual de supabase auth
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("No se pudo obtener la sesión del usuario");
            }

            // Volver a consultar los datos del usuario (que incluyen el rol)
            const newData = await fetchUserSessionData(user);

            // Actualizar el store
            setSessionData(newData);

            // Verificar si ahora tiene rol
            if (newData.user.role && newData.user.role.nombre) {
                toast.success("Rol validado correctamente");
            } else {
                toast.error("El usuario aún no tiene un rol asignado");
            }
        } catch (error) {
            console.error("Error validando rol:", error);
            toast.error("Error al validar el rol. Inténtalo de nuevo.");
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <AlertDialog open={shouldShow}>
            <AlertDialogContent className="max-w-md" onEscapeKeyDown={(e) => e.preventDefault()}>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <ShieldAlert className="h-6 w-6" />
                        <AlertDialogTitle className="text-xl">Acceso Restringido</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base space-y-2">
                        <p>
                            Tu usuario no tiene un rol asignado en el sistema para esta ubicación o de forma global.
                        </p>
                        <p className="font-medium text-foreground">
                            Por favor, comunícate con el administrador del sistema para solicitar la asignación de un rol.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center mt-4">
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Evitar que se cierre el modal
                            handleValidateRole();
                        }}
                        disabled={isValidating}
                        className="w-full sm:w-auto min-w-[200px]"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Validando acceso...
                            </>
                        ) : (
                            "Validar si ya tengo rol asignado"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
