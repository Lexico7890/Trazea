import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function InventoryTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px]">Referencia</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[150px]">Tipo</TableHead>
                    <TableHead className="w-[120px]">Cant. Mínima</TableHead>
                    <TableHead className="w-[120px]">Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-full max-w-[300px]" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-5 w-28 rounded-full" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
