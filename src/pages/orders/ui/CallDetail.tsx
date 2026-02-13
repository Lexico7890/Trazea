import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Phone, MessageCircle, Info, Save, ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { CallHistory } from "../model/types";

const callFormSchema = z.object({
    comment: z.string().optional(),
});

type CallFormValues = z.infer<typeof callFormSchema>;

interface CallDetailProps {
    orderId: number;
    orderNumber: number;
    onBack: () => void;
}

export function CallDetail({ orderId, orderNumber, onBack }: CallDetailProps) {
    const [isAnswered, setIsAnswered] = useState(true);
    const [callHistory, setCallHistory] = useState<CallHistory[]>(() => {
        const now = Date.now();
        return [
            {
                id: 1,
                order_id: orderId,
                call_date: new Date(now - 86400000).toISOString(),
                answered: true,
                comment: "Cliente confirmó receipt de la orden",
                created_at: new Date(now - 86400000).toISOString(),
            },
            {
                id: 2,
                order_id: orderId,
                call_date: new Date(now - 172800000).toISOString(),
                answered: false,
                comment: "No contestó, se envió mensaje de texto",
                created_at: new Date(now - 172800000).toISOString(),
            },
        ];
    });

    const form = useForm<CallFormValues>({
        resolver: zodResolver(callFormSchema),
        defaultValues: {
            comment: "",
        },
    });

    const onSubmit = (values: CallFormValues) => {
        const newCall: CallHistory = {
            id: callHistory.length + 1,
            order_id: orderId,
            call_date: new Date().toISOString(),
            answered: isAnswered,
            comment: values.comment,
            created_at: new Date().toISOString(),
        };

        setCallHistory([newCall, ...callHistory]);
        form.reset();
    };

    const handlePhoneToggle = () => {
        setIsAnswered(!isAnswered);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">Detalles de Llamada</h2>
                        <p className="text-gray-500">Orden #{orderNumber}</p>
                    </div>
                </div>
            </div>

            <Card className="bg-background">
                <CardContent className="p-6">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                            <div className="flex flex-col items-center space-y-3">
                                <Button
                                    type="button"
                                    onClick={handlePhoneToggle}
                                    className={cn(
                                        "w-[120px] h-[120px] rounded-full p-0 transition-all duration-300",
                                        isAnswered
                                            ? "bg-green-500 hover:bg-green-600 shadow-green-300"
                                            : "bg-red-500 hover:bg-red-600 shadow-red-300"
                                    )}
                                    style={{
                                        boxShadow: isAnswered
                                            ? "0 0 15px rgba(34, 197, 94, 0.5)"
                                            : "0 0 15px rgba(239, 68, 68, 0.5)",
                                    }}
                                >
                                    <Phone className="text-white" />
                                </Button>
                                <span className="text-sm font-medium text-gray-600">
                                    {isAnswered ? "Contestó" : "No contestó"}
                                </span>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="form-field">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Comentario
                                    </label>
                                    <Textarea
                                        placeholder="Agregar comentarios sobre la llamada..."
                                        className="resize-none min-h-[100px]"
                                        {...form.register("comment")}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {!isAnswered && (
                            <div className="flex items-center p-4 bg-yellow-600/20 border border-yellow-200 rounded-lg">
                                <Info className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium">Información importante</p>
                                    <p>
                                        Se completará el ciclo de comunicación mediante mensaje de texto y correo electrónico.
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Historial de Llamadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {callHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No hay llamadas registradas
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Comentario</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {callHistory.map((call) => (
                                    <TableRow key={call.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(call.call_date), "dd/MM/yyyy HH:mm", {
                                                locale: es,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                                    call.answered
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                )}
                                            >
                                                {call.answered ? "Contestó" : "No contestó"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[300px]">
                                            <div className="truncate">
                                                {call.comment || "Sin comentarios"}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}