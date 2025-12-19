import { useState, type FormEvent } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useTechnicians } from "../queries";
import AutocompleteInput from "@/components/AutocompleteInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function GuaranteesForm() {
  const { sessionData } = useUserStore();

  // State for form fields
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [mileage, setMileage] = useState<string>(""); // Text as requested
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<{ id_repuesto: string, referencia: string, nombre: string } | null>(null);
  const [applicant, setApplicant] = useState<string>(""); // Owner name
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [warrantyReason, setWarrantyReason] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch technicians based on selected location
  const { data: technicians } = useTechnicians(selectedLocationId);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!selectedLocationId) return toast.info("Seleccione un taller");
    if (!orderNumber) return toast.info("Ingrese el número de orden");
    if (!mileage) return toast.info("Ingrese el kilometraje");
    if (!selectedPart) return toast.info("Seleccione un repuesto");
    if (!applicant) return toast.info("Ingrese el solicitante");
    if (!selectedTechnicianId) return toast.info("Seleccione un técnico");
    if (!warrantyReason) return toast.info("Ingrese la observación de garantía");

    // TODO: Upload image to Supabase bucket
    // Bucket name: [INSERT_BUCKET_NAME_HERE]

    // Construct data object
    const formData = {
      fecha: new Date().toISOString(), // Current date
      taller_id: selectedLocationId,
      orden: orderNumber,
      kilometraje: mileage,
      observaciones_cliente: customerNotes,
      repuesto_id: selectedPart.id_repuesto,
      solicitante: applicant,
      tecnico_id: selectedTechnicianId,
      observacion_garantia: warrantyReason,
      imagen: selectedFile ? selectedFile.name : null
    };

    console.log("Form Data Submitted:", formData);
    toast.success("Formulario listo para integración (UI Only)");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registro de Garantía</CardTitle>
        <CardDescription>Complete los datos para registrar una nueva garantía.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Taller (Workshop) */}
          <div className="grid gap-2">
            <Label htmlFor="location">Taller</Label>
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Seleccionar taller" />
              </SelectTrigger>
              <SelectContent>
                {sessionData?.locations?.map((loc) => (
                  <SelectItem key={loc.id_localizacion} value={loc.id_localizacion}>
                    {loc.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Orden */}
            <div className="grid gap-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Número de orden"
              />
            </div>

            {/* Kilometraje (Text) */}
            <div className="grid gap-2">
              <Label htmlFor="mileage">Kilometraje</Label>
              <Input
                id="mileage"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Ej: 50000 o 'Apagada'"
              />
            </div>
          </div>

          {/* Observaciones Cliente */}
          <div className="grid gap-2">
            <Label htmlFor="customerNotes">Observaciones cliente</Label>
            <Textarea
              id="customerNotes"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Detalles reportados por el cliente"
            />
          </div>

          {/* Repuesto */}
          <div className="grid gap-2">
            <Label>Repuesto</Label>
            <AutocompleteInput
              selected={selectedPart}
              setSelected={setSelectedPart}
              id_localizacion={selectedLocationId}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Solicitante */}
            <div className="grid gap-2">
              <Label htmlFor="applicant">Solicitante</Label>
              <Input
                id="applicant"
                value={applicant}
                onChange={(e) => setApplicant(e.target.value)}
                placeholder="Nombre del dueño del vehículo"
              />
            </div>

            {/* Tecnico */}
            <div className="grid gap-2">
              <Label htmlFor="technician">Técnico</Label>
              <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId} disabled={!selectedLocationId}>
                <SelectTrigger id="technician">
                  <SelectValue placeholder={selectedLocationId ? "Seleccionar técnico" : "Seleccione un taller primero"} />
                </SelectTrigger>
                <SelectContent>
                  {technicians?.map((tech: any) => (
                    <SelectItem key={tech.id_usuario} value={tech.id_usuario}>
                      {tech.nombre_usuario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observacion Garantia */}
          <div className="grid gap-2">
            <Label htmlFor="warrantyReason">Observación garantía</Label>
            <Textarea
              id="warrantyReason"
              value={warrantyReason}
              onChange={(e) => setWarrantyReason(e.target.value)}
              placeholder="Justificación técnica de la garantía"
            />
          </div>

          {/* Imagen */}
          <div className="grid gap-2">
            <Label htmlFor="image">Imagen</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {/* TODO: Implement upload logic to Supabase bucket.
                Bucket Name placeholder: [BUCKET_NAME_GOES_HERE]
            */}
          </div>

          <Button type="submit" className="w-full mt-4">Guardar Garantía</Button>
        </form>
      </CardContent>
    </Card>
  );
}
