import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/shared/ui/skeleton';
import { AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getCountHistory } from "../api";
import { Button } from '@/shared/ui/button';
import { useState } from 'react';
import { ConteoDetailModal } from './ConteoDetailModal';

export function ConteoHistoryTable() {
  const [selectedCountId, setSelectedCountId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: history, isLoading, isError, error } = useQuery({
    queryKey: ['countHistory'],
    queryFn: getCountHistory,
  });

  const handleViewDetails = (id: string) => {
    setSelectedCountId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCountId(null);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Historial de Conteos</h3>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-destructive">
                  <AlertCircle className="inline-block mr-2" />
                  Error al cargar el historial: {error.message}
                </TableCell>
              </TableRow>
            ) : history && history.length > 0 ? (
              history.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(item.fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.usuario}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(item.id_conteo || item.id)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No hay historial de conteos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConteoDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        idConteo={selectedCountId}
      />
    </div>
  );
}
