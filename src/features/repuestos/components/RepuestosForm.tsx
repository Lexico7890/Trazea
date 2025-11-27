import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Repuesto, RepuestoFormData } from "../types";
import { useEffect } from "react";

interface RepuestosFormProps {
    initialData?: Repuesto;
    onSubmit: (data: RepuestoFormData) => void;
    isLoading?: boolean;
    onCancel: () => void;
}

export function RepuestosForm({
    initialData,
    onSubmit,
    isLoading,
    onCancel,
}: RepuestosFormProps) {
    const form = useForm<RepuestoFormData>({
        defaultValues: {
            referencia: "",
            nombre: "",
            cantidad_minima: 0,
            descontinuado: false,
            tipo: "General",
            fecha_estimada: null,
            url_imagen: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                referencia: initialData.referencia,
                nombre: initialData.nombre,
                cantidad_minima: initialData.cantidad_minima,
                descontinuado: initialData.descontinuado,
                tipo: initialData.tipo,
                fecha_estimada: initialData.fecha_estimada,
                url_imagen: initialData.url_imagen || "",
            });
        }
    }, [initialData, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="referencia"
                    rules={{ required: "La referencia es obligatoria" }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Referencia</FormLabel>
                            <FormControl>
                                <Input placeholder="REF-123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="nombre"
                    rules={{ required: "El nombre es obligatorio" }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre del repuesto" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tipo"
                        rules={{ required: "El tipo es obligatorio" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Motor">Motor</SelectItem>
                                        <SelectItem value="Transmision">Transmisión</SelectItem>
                                        <SelectItem value="Frenos">Frenos</SelectItem>
                                        <SelectItem value="Suspension">Suspensión</SelectItem>
                                        <SelectItem value="Electrico">Eléctrico</SelectItem>
                                        <SelectItem value="Carroceria">Carrocería</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cantidad_minima"
                        rules={{ required: "La cantidad mínima es obligatoria", min: 0 }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cantidad Mínima</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="fecha_estimada"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha Estimada (Opcional)</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="url_imagen"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Imagen (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="descontinuado"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Descontinuado
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
