import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from './FileUpload';
import { ConteoHistoryTable } from './ConteoHistoryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { read, utils } from 'xlsx';
import { sendCountData } from '../services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ConteoPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [countType, setCountType] = useState<'completo' | 'parcial'>('parcial');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (processedData: { REF: string; CANT: number }[]) =>
      sendCountData(processedData, countType),
    onSuccess: () => {
      toast.success('Conteo enviado exitosamente.');
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
      const jsonData = utils.sheet_to_json<{ REF?: string; CANT?: number }>(worksheet, {
        header: ['REF', 'CANT'],
        range: 1, // Skip header row
      });

      const filteredData = jsonData
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side: File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Cargar Archivos de Conteo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUpload files={files} onFilesChange={setFiles} />

            <div className="space-y-2">
              <label htmlFor="countType" className="font-semibold">Tipo de Conteo</label>
              <Select
                value={countType}
                onValueChange={(value) => setCountType(value as 'completo' | 'parcial')}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="countType">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completo">Completo</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
