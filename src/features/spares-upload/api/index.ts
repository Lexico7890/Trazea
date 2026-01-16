import { createRepuesto, type RepuestoFormData } from '@/entities/repuestos';
import * as XLSX from 'xlsx';

export async function bulkUploadRepuestos(file: File): Promise<{ success: number; errors: Array<{ row: unknown; error: unknown }> }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                let successCount = 0;
                const errors = [];

                for (const row of jsonData as Array<Record<string, unknown>>) {
                    try {
                        // Validate and map row data to RepuestoFormData
                        // This is a basic mapping, might need adjustment based on Excel structure
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const r: any = row;
                        const repuestoData: RepuestoFormData = {
                            referencia: r.referencia || "",
                            nombre: r.nombre || "",
                            descontinuado: r.descontinuado === 'TRUE' || r.descontinuado === true,
                            tipo: r.tipo || 'General',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            fecha_estimada: r.fecha_estimada ? new Date(r.fecha_estimada as any).toISOString() : null,
                            url_imagen: r.url_imagen || null,
                            marca: r.marca || "MINCA",
                            descripcion: r.descripcion || "",
                        };

                        await createRepuesto(repuestoData);
                        successCount++;
                    } catch (err) {
                        errors.push({ row, error: err });
                    }
                }

                resolve({ success: successCount, errors });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
}