import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { read, utils } from 'xlsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClipboardList } from 'lucide-react';
import { PartialCountModal, sendCountData } from '@/features/count-spares';
import { ConteoHistoryTable } from './ConteoHistoryTable';
import { FileUpload } from './FileUpload';

export function ConteoPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isPartialCountModalOpen, setPartialCountModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (processedData: { REF: string; CANT: number }[]) =>
      sendCountData(processedData), // Always send as 'completo'
    onSuccess: () => {
      toast.success('Conteo completo enviado exitosamente.');
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ['countHistory'] });
    },
    onError: (error) => {
      toast.error(`Error al enviar el conteo: ${error.message}`);
    },
  });

  const processFiles = async () => {
    let allData: { REF: string; CANT: number }[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json<{ 'REF.'?: string; 'CANT.'?: number }>(worksheet, {
        range: 1, // Skip the first row to use the second row as headers
      });

      const mappedData = jsonData.map(row => ({
        REF: row['REF.'],
        CANT: row['CANT.'],
      }));

      const filteredData = mappedData
        .filter(row => row.CANT !== undefined && row.CANT > 0 && row.REF !== undefined)
        .map(row => ({ REF: String(row.REF), CANT: Number(row.CANT) }));

      allData = [...allData, ...filteredData];
    }
    return allData;
  };

  const handleSend = async () => {
    const processedData = await processFiles();
    if (processedData.length > 0) {
      mutation.mutate(processedData);
    } else {
      toast.warning('No se encontraron datos válidos para enviar.');
    }
  };

  return (
    <div className="container mx-auto p-2 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Conteo de Inventario</h1>
        <Button variant="outline" onClick={() => setPartialCountModalOpen(true)}>
          <ClipboardList className="h-4 w-4 mr-2" />
          Conteo Parcial
        </Button>
      </div>
      <PartialCountModal
        isOpen={isPartialCountModalOpen}
        onOpenChange={setPartialCountModalOpen}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side: File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Cargar Archivo de Conteo Completo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUpload files={files} onFilesChange={setFiles} />

            <Button onClick={handleSend} disabled={files.length === 0 || mutation.isPending}>
              {mutation.isPending ? 'Enviando...' : 'Enviar Conteo'}
            </Button>
          </CardContent>
        </Card>

        {/* Right side: History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <ConteoHistoryTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
