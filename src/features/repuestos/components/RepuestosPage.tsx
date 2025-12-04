import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { RepuestosTable } from "./RepuestosTable";
import { RepuestosFilters } from "./RepuestosFilters";
import { RepuestosForm } from "./RepuestosForm";
import { BulkUpload } from "./BulkUpload";
import { useRepuestosQuery, useRepuestosMutations } from "../hooks/useRepuestosQuery";
import { Pagination } from "@/components/common/Pagination";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Repuesto, RepuestosParams } from "../types";

export default function RepuestosPage() {
    // State for filters
    const [filters, setFilters] = useState<RepuestosParams>({
        page: 1,
        limit: 10,
        search: "",
        tipo: "all",
        descontinuado: undefined, // undefined means all in our logic, but UI uses 'all' string
        order_by: "created_at",
        direction: "desc",
    });

    // UI State for filters (to map 'all', 'active', 'discontinued' to boolean/undefined)
    const [uiFilters, setUiFilters] = useState({
        tipo: "all",
        descontinuado: "all",
    });

    // State for Sheet (Create/Edit)
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingRepuesto, setEditingRepuesto] = useState<Repuesto | undefined>(undefined);

    // State for Delete Dialog
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Queries and Mutations
    const { data, isLoading, isError, refetch, isRefetching } = useRepuestosQuery(filters);
    const { createMutation, updateMutation, deleteMutation } = useRepuestosMutations();

    // Handlers
    const handleSearchChange = (value: string) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleTipoChange = (value: string) => {
        setUiFilters((prev) => ({ ...prev, tipo: value }));
        setFilters((prev) => ({ ...prev, tipo: value, page: 1 }));
    };

    const handleDescontinuadoChange = (value: string) => {
        setUiFilters((prev) => ({ ...prev, descontinuado: value }));
        let descontinuadoValue: boolean | undefined = undefined;
        if (value === "active") descontinuadoValue = false;
        if (value === "discontinued") descontinuadoValue = true;
        setFilters((prev) => ({ ...prev, descontinuado: descontinuadoValue, page: 1 }));
    };

    const handleResetFilters = () => {
        setUiFilters({ tipo: "all", descontinuado: "all" });
        setFilters({
            page: 1,
            limit: 10,
            search: "",
            tipo: "all",
            descontinuado: undefined,
            order_by: "created_at",
            direction: "desc",
        });
    };

    const handleSort = (column: keyof Repuesto) => {
        setFilters((prev) => ({
            ...prev,
            order_by: column,
            direction: prev.order_by === column && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleLimitChange = (limit: number) => {
        setFilters((prev) => ({ ...prev, limit, page: 1 }));
    };

    const handleCreate = () => {
        setEditingRepuesto(undefined);
        setIsSheetOpen(true);
    };

    const handleEdit = (repuesto: Repuesto) => {
        setEditingRepuesto(repuesto);
        setIsSheetOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
        }
    };

    const handleSubmitForm = async (formData: any) => {
        try {
            if (editingRepuesto) {
                await updateMutation.mutateAsync({ id: editingRepuesto.id_repuesto, data: formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsSheetOpen(false);
        } catch (error) {
            // Error handled in mutation
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl md:text-4xl font-bold">Gestión de Repuestos</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                    </Button>
                    <BulkUpload onSuccess={() => data && useRepuestosQuery(filters)} />
                    <Button onClick={handleCreate} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <RepuestosFilters
                        search={filters.search || ""}
                        tipo={uiFilters.tipo}
                        descontinuado={uiFilters.descontinuado}
                        onSearchChange={handleSearchChange}
                        onTipoChange={handleTipoChange}
                        onDescontinuadoChange={handleDescontinuadoChange}
                        onReset={handleResetFilters}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="text-center py-10">Cargando...</div>
                    ) : isError ? (
                        <div className="text-center py-10 text-destructive">Error al cargar repuestos</div>
                    ) : (
                        <>
                            <RepuestosTable
                                items={data?.items || []}
                                orderBy={filters.order_by || "created_at"}
                                direction={filters.direction || "desc"}
                                onSort={handleSort}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                            />
                            <div className="mt-4">
                                <Pagination
                                    currentPage={filters.page || 1}
                                    totalPages={data?.page_count || 1}
                                    totalItems={data?.total_count || 0}
                                    itemsPerPage={filters.limit || 10}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleLimitChange}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingRepuesto ? "Editar Repuesto" : "Nuevo Repuesto"}</SheetTitle>
                        <SheetDescription>
                            {editingRepuesto
                                ? "Modifica los datos del repuesto aquí."
                                : "Ingresa los datos para crear un nuevo repuesto."}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="">
                        <RepuestosForm
                            initialData={editingRepuesto}
                            onSubmit={handleSubmitForm}
                            onCancel={() => setIsSheetOpen(false)}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el repuesto.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
