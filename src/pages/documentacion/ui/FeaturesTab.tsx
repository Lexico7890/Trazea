import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Warehouse, Send, SendToBack, PackageOpen, NotebookPen } from "lucide-react";

export function FeaturesTab() {
  const features = [
    {
      title: "Gestión de Inventario",
      icon: <Warehouse className="w-8 h-8 text-[#2ecc71]" />,
      description: "Visualiza y gestiona el stock de repuestos de tu taller. Puedes analizar si el stock es bajo, actualizar cantidades de inmediato o marcar piezas como nuevas o descontinuadas."
    },
    {
      title: "Solicitudes de Repuestos (Transferencias)",
      icon: <Send className="w-8 h-8 text-[#2ecc71]" />,
      description: "Permite enviar requerimientos de piezas a otras sedes (almacenes). Una vez que la sede lo envía, puedes actualizar el estatus en la pestaña de 'Enviadas'. Es indispensable para mantener el equilibrio de insumos en tiempo real con Supabase."
    },
    {
      title: "Seguimiento y Órdenes",
      icon: <SendToBack className="w-8 h-8 text-[#2ecc71]" />,
      description: "Controla las órdenes a taller enviando un formato estructurado o una solicitud de servicio. Maneja aprobaciones e historiales de los mantenimientos a realizar o realizados en los vehículos."
    },
    {
      title: "Catálogo de Repuestos",
      icon: <PackageOpen className="w-8 h-8 text-[#2ecc71]" />,
      description: "El listado base donde se asientan todos los repuestos con su código corto de referencia. Cuando necesites un nuevo ítem en inventario, arráncalo desde los 'Repuestos'."
    },
    {
      title: "Registros y Logs",
      icon: <NotebookPen className="w-8 h-8 text-[#2ecc71]" />,
      description: "Audita cada transferencia y salida a taller de los equipos de scooter o componentes eléctricos, brindando una trazabilidad total del movimiento de las piezas."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div className="md:col-span-2">
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader>
            <CardTitle>Bienvenido a Trazea Minca</CardTitle>
            <CardDescription className="text-zinc-400">
              Trazea es el sistema maestro de operaciones creado para Minca. Permite unificar los inventarios de repuestos, gestionar múltiples sedes, unificar la trazabilidad de reparaciones y sincronizar estados en tiempo real (Base de datos remota usando WebSockets / Realtime).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      {features.map((feature, idx) => (
        <Card key={idx} className="group hover:-translate-y-1 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-xl bg-zinc-900 shadow-inner group-hover:shadow-[#2ecc71]/20 transition-all">
              {feature.icon}
            </div>
            <CardTitle className="text-lg">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
