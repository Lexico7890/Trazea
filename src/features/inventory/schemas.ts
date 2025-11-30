import { z } from 'zod';

export const insertInventorySchema = z.object({
  repuesto: z.object({
    id_repuesto: z.string(),
    referencia: z.string(),
    nombre: z.string(),
  }, { required_error: "Debes seleccionar un repuesto" }),
  cantidad: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
  posicion: z.string().optional(),
});

export type InsertInventoryFormValues = z.infer<typeof insertInventorySchema>;
