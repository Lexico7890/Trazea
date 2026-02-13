import { useOrderFollowList, useScooterTypes } from "../api/useOrderFollow";
import { useOrderFollowFilters } from "../lib/useOrderFollowFilters";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DataTablePagination } from "@/shared/ui/data-table/data-table-pagination";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Phone, Loader2, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface OrderFollowTableProps {
    onCallClick?: (orderId: number, orderNumber: number) => void;
}

export function OrderFollowTable({ onCallClick }: OrderFollowTableProps = {}) {
    const { filters, setFilters } = useOrderFollowFilters();
    const { data, isLoading } = useOrderFollowList({ filters });
    const { data: scooterTypes } = useScooterTypes();

    const orders = data?.data ?? [];
    const count = data?.count ?? 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por orden..."
                        className="pl-8 sm:w-[200px] md:w-[300px] bg-card"
                        value={filters.order ?? ""}
                        onChange={(e) => setFilters({ order: e.target.value })}
                    />
                </div>
                <Select
                    value={filters.scooterType ?? "all"}
                    onValueChange={(value) => setFilters({ scooterType: value === "all" ? undefined : value })}
                >
                    <SelectTrigger className="sm:w-[200px] md:w-[250px] bg-card">
                        <SelectValue placeholder="Filtrar por scooter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los scooters</SelectItem>
                        {scooterTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                                {type.name} - {type.power}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={String(filters.level ?? "all")}
                    onValueChange={(value) => setFilters({ level: value === "all" ? undefined : Number(value) })}
                >
                    <SelectTrigger className="w-[180px] bg-card">
                        <SelectValue placeholder="Filtrar por nivel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los niveles</SelectItem>
                        <SelectItem value="1">Nivel 1 (Bajo)</SelectItem>
                        <SelectItem value="2">Nivel 2 (Medio)</SelectItem>
                        <SelectItem value="3">Nivel 3 (Alto)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading && (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!isLoading && !orders.length && (
                <div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted/20">
                    No hay registros que coincidan con los filtros.
                </div>
            )}

            {!isLoading && orders.length > 0 && (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha Creación</TableHead>
                                <TableHead>N° Orden</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Llamadas</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        {formatDistanceToNow(new Date(order.created_at), {
                                            addSuffix: true,
                                            locale: es,
                                        })}
                                    </TableCell>
                                    <TableCell>{order.number}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                            order.status === "P.Autorizar" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                                        )}>
                                            {order.status || "N/A"}
                                        </span>
                                    </TableCell>
                                    <TableCell>{order.phone || "N/A"}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{order.email || "N/A"}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                            {order.call_count || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => {
                                                if (onCallClick) {
                                                    onCallClick(order.id, order.number);
                                                } else {
                                                    console.log("Navigate to phone view for order", order.id);
                                                }
                                            }}
                                        >
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {count > filters.pageSize && (
                <DataTablePagination
                    page={filters.page}
                    pageSize={filters.pageSize}
                    totalCount={count}
                    setPage={(page) => setFilters({ page })}
                    setPageSize={(pageSize) => setFilters({ pageSize })}
                />
            )}
        </div>
    );
}
