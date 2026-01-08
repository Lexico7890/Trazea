import { supabase } from "@/shared/api";

export async function createGuarantee(warrantyData: Record<string, unknown>) {
    const { error } = await supabase
        .from('garantias')
        .insert([warrantyData]);

    if (error) {
        console.error('Error creating warranty:', error);
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