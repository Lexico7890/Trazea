import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { registrarConteo } from '../api';
import { useCountResults } from '../model/hooks/useCountResults';
import { useCountFilters } from '../model/hooks/useCountFilters';
import { ColorLegend } from './components/ColorLegend';
import { FilterSection } from './components/FilterSection';
import { CountTable } from './components/CountTable';
import { SendDataModal } from './components/SendDataModal';

export function ResultadosConteoPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialResults = location.state?.results || [];

    // Custom hooks
    const {
        results,
        handlePqChange,
        totalItemsAuditados,
        totalDiferenciaEncontrada,
        totalItemsPq,
    } = useCountResults(initialResults);

    const {
        filters,
        updateFilter,
        filteredResults,
        paginatedResults,
        currentPage,
        setCurrentPage,
        totalPages,
        startIndex,
        endIndex,
    } = useCountFilters(results);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [observaciones, setObservaciones] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendData = async () => {
        setIsSubmitting(true);
        try {
            const id_localizacion = localStorage.getItem('minca_location_id');
            const id_usuario = localStorage.getItem('minca_user_id');

            if (!id_localizacion || !id_usuario) {
                toast.error('No se encontró la información de localización o usuario.');
                return;
            }

            await registrarConteo({
                id_localizacion,
                id_usuario,
                tipo: 'total',
                total_items_auditados: totalItemsAuditados,
                total_diferencia_encontrada: totalDiferenciaEncontrada,
                total_items_pq: totalItemsPq,
                observaciones: observaciones || undefined,
                items: results,
            });

            toast.success('El conteo ha sido registrado correctamente.');
            setIsModalOpen(false);
            navigate('/inventario/conteo');
        } catch (error) {
            console.error('Error sending count data:', error);
            toast.error('Hubo un error al registrar el conteo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-2 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold">Resultados del Conteo</h1>
                    <ColorLegend />
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Send className="h-4 w-4" />
                    Enviar Datos
                </Button>
            </div>

            {/* Filters */}
            <FilterSection filters={filters} onFilterChange={updateFilter} />

            {/* Table */}
            <CountTable
                paginatedResults={paginatedResults}
                startIndex={startIndex}
                currentPage={currentPage}
                totalPages={totalPages}
                filteredCount={filteredResults.length}
                endIndex={endIndex}
                onPqChange={handlePqChange}
                onPageChange={setCurrentPage}
            />

            {/* Modal */}
            <SendDataModal
                isOpen={isModalOpen}
                isSubmitting={isSubmitting}
                totalItemsAuditados={totalItemsAuditados}
                totalDiferenciaEncontrada={totalDiferenciaEncontrada}
                totalItemsPq={totalItemsPq}
                observaciones={observaciones}
                onObservacionesChange={setObservaciones}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleSendData}
            />
        </div>
    );
}
