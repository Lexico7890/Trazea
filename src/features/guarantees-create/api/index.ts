import { supabase } from "@/shared/api";

export async function createGuarantee(warrantyData: Record<string, unknown>) {
    // Check if we have an ID to update an existing record
    const { error } = await supabase
        .from('garantias')
        .update({
            estado: warrantyData.estado,
            comentarios_resolucion: warrantyData.comentarios_resolucion,
            kilometraje: warrantyData.kilometraje,
            motivo_falla: warrantyData.motivo_falla,
            solicitante: warrantyData.solicitante,
            url_evidencia_foto: warrantyData.url_evidencia_foto,
            updated_at: new Date().toISOString()
        })
        .eq('id_garantia', warrantyData.id_garantia)
        .select()
        .single();

    if (error) {
        console.error('Error updating guarantee status:', error);
        throw new Error(error.message);
    }
}

export async function uploadWarrantyImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `warranty-evidence/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('imagenes-repuestos-garantias')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error(uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('imagenes-repuestos-garantias')
        .getPublicUrl(filePath);

    return publicUrl;
}