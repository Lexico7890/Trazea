import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrderFollow, useScooterTypes } from "../api/useOrderFollow";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import { Hash, Bike, Send } from "lucide-react";

const formSchema = z.object({
    number: z.coerce.number().min(1, "El número es requerido"),
    id_scooter_type: z.string().uuid("Seleccione un tipo de scooter"),
    level: z.number().min(1).max(3),
});

type FormValues = z.infer<typeof formSchema>;

export function OrderFollowForm() {
    const { data: scooterTypes, isLoading: loadingTypes } = useScooterTypes();
    const { mutate, isPending } = useCreateOrderFollow();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            number: 0,
            id_scooter_type: "",
            level: 0,
        },
    });

    const onSubmit = (values: FormValues) => {
        mutate(values, {
            onSuccess: () => {
                form.reset({
                    number: 0,
                    id_scooter_type: "",
                    level: 0
                });
            }
        });
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] text-white shadow-2xl p-8 mb-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Nuevo Seguimiento</h2>
                <p className="text-gray-400">Ingrese los detalles para el seguimiento de la orden de servicio.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField<FormValues>
                            control={form.control}
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold tracking-wider text-gray-500 mb-2 block">
                                        Número de Orden
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                            <Input
                                                type="number"
                                                placeholder="999999"
                                                className="bg-[#1a1a1a] border-border/10 focus:border-white/20 h-14 pl-12 rounded-xl text-lg font-medium placeholder:text-gray-700 transition-all"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField<FormValues>
                            control={form.control}
                            name="id_scooter_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold tracking-wider text-gray-500 mb-2 block">
                                        Tipo de Scooter
                                    </FormLabel>
                                    <div className="relative group">
                                        <Bike className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10 group-focus-within:text-white transition-colors" />
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-[#1a1a1a] border-border/10 focus:border-white/20 h-14 pl-12 rounded-xl text-lg font-medium text-gray-200 transition-all">
                                                    <SelectValue placeholder="Seleccione un modelo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-gray-200">
                                                {loadingTypes ? (
                                                    <div className="p-4 text-sm text-gray-500 text-center">
                                                        Cargando...
                                                    </div>
                                                ) : (
                                                    scooterTypes?.map((type) => (
                                                        <SelectItem key={type.id} value={type.id} className="focus:bg-white/10 focus:text-white cursor-pointer py-3">
                                                            {type.name} - {type.power}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField<FormValues>
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="uppercase text-xs font-bold tracking-wider text-gray-500 mb-4 block">
                                    Nivel de Prioridad
                                </FormLabel>
                                <div className="grid grid-cols-3 gap-4 bg-[#111] p-2 rounded-2xl border border-white/5">
                                    {[
                                        {
                                            value: 1,
                                            label: "BAJA",
                                            baseColor: "text-[#39ff14]",
                                            glowColor: "shadow-[0_0_30px_-5px_#39ff1440]",
                                            borderColor: "border-[#39ff14]/50",
                                            bgActive: "bg-[#39ff14]/10"
                                        },
                                        {
                                            value: 2,
                                            label: "MEDIA",
                                            baseColor: "text-[#ffff00]",
                                            glowColor: "shadow-[0_0_30px_-5px_#ffff0040]",
                                            borderColor: "border-[#ffff00]/50",
                                            bgActive: "bg-[#ffff00]/10"
                                        },
                                        {
                                            value: 3,
                                            label: "ALTA",
                                            baseColor: "text-[#ff073a]",
                                            glowColor: "shadow-[0_0_30px_-5px_#ff073a40]",
                                            borderColor: "border-[#ff073a]/50",
                                            bgActive: "bg-[#ff073a]/10"
                                        },
                                    ].map((option) => {
                                        const isSelected = field.value === option.value;
                                        return (
                                            <div
                                                key={option.value}
                                                className={cn(
                                                    "cursor-pointer relative flex flex-col items-center justify-center py-6 rounded-xl transition-all duration-300 border border-transparent",
                                                    isSelected ? cn("bg-white/5 border-white/10", option.glowColor) : "hover:bg-white/5 opacity-60 hover:opacity-100"
                                                )}
                                                onClick={() => field.onChange(option.value)}
                                            >
                                                {/* Background Glow for selected item - subtle */}
                                                {isSelected && (
                                                    <div className={cn("absolute inset-0 rounded-xl opacity-20 blur-xl", option.bgActive)} />
                                                )}

                                                <div
                                                    className={cn(
                                                        "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 transition-all duration-300 mb-3 z-10",
                                                        isSelected
                                                            ? cn(option.baseColor, option.borderColor, "bg-black/40 shadow-lg scale-110")
                                                            : "text-gray-500 border-gray-700"
                                                    )}
                                                >
                                                    {option.value}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] uppercase font-bold tracking-widest z-10 transition-colors",
                                                    isSelected ? option.baseColor : "text-gray-600"
                                                )}>
                                                    {option.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-[#ff073a] hover:bg-[#ff073a]/90 text-white shadow-[0_0_25px_-5px_#ff073a] rounded-xl px-8 py-6 text-lg font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            {isPending ? "Guardando..." : (
                                <>
                                    Crear Registro
                                    <Send className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
