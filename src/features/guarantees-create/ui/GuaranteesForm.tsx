import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "sonner";
import { useUserStore } from "@/entities/user";
import { useCreateGuarantee } from "../lib/useCreateGuarantees";
import { useTechnicians } from "@/entities/technical";
import { uploadWarrantyImage } from "../api";
import { AutocompleteInput } from "@/entities/inventario";

export function GuaranteesForm() {
  const { currentLocation, sessionData } = useUserStore();
  const createGuaranteeMutation = useCreateGuarantee();

  // State for form fields
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [mileage, setMileage] = useState<string>(""); // Text as requested
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<{ id_repuesto: string, referencia: string, nombre: string } | null>(null);
  const [applicant, setApplicant] = useState<string>(""); // Owner name
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [warrantyReason, setWarrantyReason] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectedLocationId = currentLocation?.id_localizacion || "";

  // Fetch technicians based on selected location
  const { data: technicians } = useTechnicians(selectedLocationId);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!selectedLocationId) return toast.info("No hay una ubicación seleccionada");
    if (!orderNumber) return toast.info("Ingrese el número de orden");
    if (!mileage) return toast.info("Ingrese el kilometraje");
    if (!selectedPart) return toast.info("Seleccione un repuesto");
    if (!applicant) return toast.info("Ingrese el solicitante");
    if (!selectedTechnicianId) return toast.info("Seleccione un técnico");
    if (!warrantyReason) return toast.info("Ingrese la observación de garantía");
    if (!selectedFile) return toast.info("Debe adjuntar una imagen como evidencia");

    try {
      let imageUrl = null;
      if (selectedFile) {
        toast.loading("Subiendo imagen...", { id: "warranty-upload" });
        imageUrl = await uploadWarrantyImage(selectedFile);
        toast.success("Imagen subida correctamente", { id: "warranty-upload" });
      }

      const guaranteeData = {
        id_repuesto: selectedPart.id_repuesto,
        referencia_repuesto: selectedPart.referencia,
        nombre_repuesto: selectedPart.nombre,
        id_localizacion: selectedLocationId,
        id_usuario_reporta: sessionData?.user.id,
        id_tecnico_asociado: selectedTechnicianId,
        motivo_falla: warrantyReason,
        url_evidencia_foto: imageUrl,
        kilometraje: mileage,
        orden: orderNumber,
        solicitante: applicant,
        comentarios_resolucion: customerNotes,
        estado: "Pendiente",
        // Optional fields from table structure (milage/order are not in table but user had them in form, maybe they go to observations?)
        // The user didn't specify where to put 'orden' and 'kilometraje' in the new table structure.
        // Looking at the table provided: id_garantia, id_repuesto, referencia_repuesto, nombre_repuesto, cantidad, id_localizacion, id_usuario_reporta, id_tecnico_asociado, motivo_falla, url_evidencia_foto, estado, comentarios_resolucion...
        // I will stick to what the user provided in the SQL + form fields that match.
      };

      await createGuaranteeMutation.mutateAsync(guaranteeData);

      toast.success("Garantía registrada exitosamente");

      // Reset form
      setOrderNumber("");
      setMileage("");
      setCustomerNotes("");
      setSelectedPart(null);
      setApplicant("");
      setSelectedTechnicianId("");
      setWarrantyReason("");
      setSelectedFile(null);
      // Reset file input manually if needed (actually it's uncontrolled in the input tag)
      const fileInput = document.getElementById("image") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error) {
      toast.error("Error al registrar la garantía");
      console.error(error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registro de Garantía</CardTitle>
        <CardDescription>Complete los datos para registrar una nueva garantía.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Taller - Hidden as it is taken from current location */}
          <div className="grid gap-2">
            <Label htmlFor="location">Taller</Label>
            <Input
              id="location"
              value={currentLocation?.nombre || ""}
              readOnly
              className="bg-muted"
            />
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
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
