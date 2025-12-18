import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AutocompleteInput from "@/components/AutocompleteInput";
import { createInventoryItem } from "../services";
import { insertInventorySchema, type InsertInventoryFormValues } from "../schemas";
import { useUserStore } from "@/store/useUserStore";

interface InventoryFormProps {
  onSuccess?: () => void;
}

export function InventoryForm({ onSuccess }: InventoryFormProps) {
  const queryClient = useQueryClient();
  const { sessionData, currentLocation } = useUserStore();

  const form = useForm<InsertInventoryFormValues>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      cantidad: 1,
      posicion: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      toast.success("Repuesto agregado al inventario correctamente");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error al agregar repuesto: ${error.message}`);
    },
  });

  const onSubmit = (values: InsertInventoryFormValues) => {
    // Try to get location from currentLocation (selected by user) or fallback to first assigned location
    const idLocalizacion = currentLocation?.id_localizacion || sessionData?.locations?.[0]?.id_localizacion;

    if (!idLocalizacion) {
      toast.error("No se encontró una localización válida para el usuario");
      return;
    }

    console.log("Submitting inventory with location:", idLocalizacion);

    mutate({
      id_repuesto: values.repuesto.id_repuesto,
      id_localizacion: String(idLocalizacion),
      cantidad: values.cantidad,
      posicion: values.posicion,
      nuevo_hasta: new Date().toISOString(), // Newly added item -> Set "New" indicator
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="repuesto"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Repuesto</FormLabel>
              <FormControl>
                <AutocompleteInput
                  selected={field.value}
                  setSelected={(val) => field.onChange(val)}
                  id_localizacion={undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cantidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="posicion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posición (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej. A-123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar al Inventario
          </Button>
        </div>
      </form>
    </Form>
  );
}
