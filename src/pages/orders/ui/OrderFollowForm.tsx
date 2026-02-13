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
import { Hash, Bike, Send, Phone, Mail, Link } from "lucide-react";

const formSchema = z.object({
    number: z.coerce.number().min(1, "El número es requerido"),
    id_scooter_type: z.string().uuid("Seleccione un tipo de scooter"),
    status: z.string().min(1, "El estado es requerido"),
    phone: z.string().min(1, "El teléfono es requerido"),
    order_link: z.string().min(1, "El link de orden es requerido"),
    email: z.string().email("Ingrese un email válido").min(1, "El email es requerido"),
});

type FormValues = z.infer<typeof formSchema>;

export function OrderFollowForm() {
    const { data: scooterTypes, isLoading: loadingTypes } = useScooterTypes();
    const { mutate, isPending } = useCreateOrderFollow();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            number: 0,
            id_scooter_type: "",
            status: "",
            phone: "",
            order_link: "",
            email: "",
        },
    });

    const onSubmit = (values: FormValues) => {
        mutate(values, {
            onSuccess: () => {
                form.reset({
                    number: 0,
                    id_scooter_type: "",
                    status: "",
                    phone: "",
                    order_link: "",
                    email: "",
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control as any}
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold tracking-wider text-gray-500 mb-2 block">
                                        Número de Orden
                                    </FormLabel>
                                    <div className="relative group">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="999999"
                                                className="bg-[#1a1a1a] border-border/10 focus:border-white/20 h-14 pl-12 rounded-xl text-lg font-medium placeholder:text-gray-700 transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
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
                                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-gray-200 max-h-52 overflow-y-auto">
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

                        <FormField
                            control={form.control as any}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold tracking-wider text-gray-500 mb-2 block">
                                        Estado
                                    </FormLabel>
                                    <div className="relative group">
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-[#1a1a1a] border-border/10 focus:border-white/20 h-14 rounded-xl text-lg font-medium text-gray-200 transition-all">
                                                    <SelectValue placeholder="Seleccione un estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-gray-200">
                                                <SelectItem value="P.Autorizar" className="focus:bg-white/10 focus:text-white cursor-pointer py-3">
                                                    P.Autorizar
                                                </SelectItem>
                                                <SelectItem value="Finalizada" className="focus:bg-white/10 focus:text-white cursor-pointer py-3">
                                                    Finalizada
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                            control={form.control as any}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold tracking-wider text-gray-500 mb-2 block">
                                        Teléfono
                                    </FormLabel>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="+1234567890"
                                                className="bg-[#1a1a1a] border-border/10 focus:border-white/20 h-14 pl-12 rounded-xl text-lg font-medium placeholder:text-gray-700 transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold tracking-wider text-gray-500 mb-2 block">
                                        Email
                                    </FormLabel>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="email@ejemplo.com"
                                                className="bg-[#1a1a1a] border-border/10 focus:border-white/20 h-14 pl-12 rounded-xl text-lg font-medium placeholder:text-gray-700 transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="order_link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold tracking-wider text-gray-500 mb-2 block">
                                        Link de Orden
                                    </FormLabel>
                                    <div className="relative group">
                                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <FormControl>
                                            <Input
                                                type="url"
                                                placeholder="https://ejemplo.com/orden"
                                                className="bg-[#1a1a1a] border-border/10 focus:border-white/20 h-14 pl-12 rounded-xl text-lg font-medium placeholder:text-gray-700 transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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