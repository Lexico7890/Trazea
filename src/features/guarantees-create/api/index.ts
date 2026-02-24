import type { Guarantee } from "@/entities/guarantees";
import { supabase } from "@/shared/api";

export async function updateGuarantees(warrantyData: Guarantee[]) {
  const promises = warrantyData.map((warranty) =>
    supabase
      .from("garantias")
      .update({
        estado: warranty.estado,
        comentarios_resolucion: warranty.comentarios_resolucion,
        kilometraje: warranty.kilometraje,
        motivo_falla: warranty.motivo_falla,
        solicitante: warranty.solicitante,
        url_evidencia_foto: warranty.url_evidencia_foto,
        updated_at: new Date().toISOString(),
      })
      .eq("id_garantia", warranty.id_garantia)
      .select()
      .single()
  );

  const results = await Promise.all(promises);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error("Errors updating guarantees:", errors.map((e) => e.error));
    throw new Error(`Failed to update ${errors.length} of ${warrantyData.length} guarantees`);
  }

  return results.map((r) => r.data);
}

export async function uploadWarrantyImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `warranty-evidence/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("imagenes-repuestos-garantias")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("imagenes-repuestos-garantias")
    .getPublicUrl(filePath);

  return publicUrl;
}
