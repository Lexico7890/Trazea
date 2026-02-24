import { useState, type FormEvent, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "sonner";
import { useUserStore } from "@/entities/user";
import { useUpdateGuarantee } from "../lib/useCreateGuarantees";
import { useTechnicians } from "@/entities/technical";
import { uploadWarrantyImage } from "../api";
import { AutocompleteInputList } from "@/entities/inventario";
import type { Guarantee } from "@/entities/guarantees";
import type { SparePart } from "@/shared/model";
import { ImageUploadMulti } from "@/features/inventario-crear-repuesto";

interface GuaranteesFormProps {
  prefillData?: Guarantee[];
}

export function GuaranteesForm({ prefillData }: GuaranteesFormProps) {
  const { currentLocation } = useUserStore();
  const createGuaranteeMutation = useUpdateGuarantee();
  const location = useLocation();

  // State for form fields
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [mileage, setMileage] = useState<string>(""); // Text as requested
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [applicant, setApplicant] = useState<string>(""); // Owner name
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [warrantyReason, setWarrantyReason] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedParts, setSelectedParts] = useState<SparePart[]>([]);

  // State to track if we are in "send mode" (pre-filled from existing warranty)
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);

  const selectedLocationId = currentLocation?.id_localizacion || "";

  // Fetch technicians based on selected location
  const { data: technicians } = useTechnicians(selectedLocationId);

  useEffect(() => {
    // Prefer passed prop data, fallback to location state if any (legacy or external link support)
    const data = prefillData;

    if (!data) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrderNumber(data[0].orden || "");
    // Assuming 'kilometraje' comes from the list item
    setMileage(data[0].kilometraje ? String(data[0].kilometraje) : "");
    setSelectedParts((prev) => [
      ...prev,
      ...data.map((item: Guarantee) => ({
        id_repuesto: item.id_repuesto,
        referencia: item.referencia_repuesto,
        nombre: item.nombre_repuesto || "",
        cantidad: item.cantidad || 1,
      })),
    ]);

    // Pre-fill technician (check if we have the ID, otherwise might need to match by name or it might be missing in LIST view)
    // The list view has 'tecnico_responsable' (name) or 'id_tecnico_asociado' (if available).
    // Assuming 'id_tecnico_asociado' is available in the object from the list query.
    if (data[0].id_tecnico_asociado) {
      setSelectedTechnicianId(data[0].id_tecnico_asociado);
    }

    setApplicant(data[0].solicitante || "");
    // setCustomerNotes(data[0].comentarios_resolucion || ""); // Maybe? User said "los demas campos si pueden ser manipulados"
    // setWarrantyReason(data[0].motivo_falla || "");

    setIsReadOnlyMode(true);
  }, [prefillData, location.state]);

  // Handle images change from ImageUploadMulti
  const handleImagesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!selectedLocationId)
      return toast.info("No hay una ubicación seleccionada");
    if (!orderNumber) return toast.info("Ingrese el número de orden");
    if (!mileage) return toast.info("Ingrese el kilometraje");
    if (!selectedParts.length) return toast.info("Seleccione un repuesto");
    if (!applicant) return toast.info("Ingrese el solicitante");
    if (!selectedTechnicianId) return toast.info("Seleccione un técnico");
    if (!warrantyReason)
      return toast.info("Ingrese la observación de garantía");
    if (selectedFiles.length === 0)
      return toast.info("Debe adjuntar al menos una imagen como evidencia");

    try {
      const imageUrls: string[] = [];
      for (const file of selectedFiles) {
        toast.loading("Subiendo imagen...", { id: "warranty-upload" });
        const imageUrl = await uploadWarrantyImage(file);
        imageUrls.push(imageUrl);
        toast.success("Imagen subida correctamente", { id: "warranty-upload" });
      }
      if (!prefillData){
        return
      }
      const guaranteeData: Guarantee[] = prefillData.map((item: Guarantee, index: number) => {
        return {
          ...item,
          estado: "Pendiente",
          url_evidencia_foto: imageUrls[index] !== undefined ? imageUrls[index] : "", // Update with new image if provided
          motivo_falla: warrantyReason,
          comentarios_resolucion: customerNotes,
          kilometraje: Number(mileage),
          solicitante: applicant,
        };
      })

      await createGuaranteeMutation.mutateAsync(guaranteeData);

      toast.success("Garantía registrada exitosamente");

      // Reset form
      setOrderNumber("");
      setMileage("");
      setCustomerNotes("");
      setApplicant("");
      setSelectedTechnicianId("");
      setWarrantyReason("");
      setIsReadOnlyMode(false);
      setSelectedFiles([]);
    } catch (error) {
      toast.error("Error al registrar la garantía");
      console.error(error);
    }
  };
  console.log("currentLocation", currentLocation);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registro de Garantía</CardTitle>
        <CardDescription>
          Complete los datos para registrar una nueva garantía.
        </CardDescription>
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
                readOnly={isReadOnlyMode}
                className={isReadOnlyMode ? "bg-muted" : ""}
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
                // User didn't request this to be locked, but "taller orden, repuesto, tecnico" were mentioned as locked.
                // Assuming Kilometaje is editable unless implied otherwise.
                // "taller orden, repuesto, tecnico, estos campos no pueden ser editados" -> does not include Kilometraje explicitly?
                // Actually, "deben estar siempre bloqueados, los demas campos si pueden ser manipulados".
                // So Kilometraje is one of "los demas".
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
            <div
              className={isReadOnlyMode ? "pointer-events-none opacity-80" : ""}
            >
              <AutocompleteInputList
                selectedParts={selectedParts}
                setSelectedParts={setSelectedParts}
                locationId={selectedLocationId}
              />
            </div>
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
              <Select
                value={selectedTechnicianId}
                onValueChange={setSelectedTechnicianId}
                disabled={!selectedLocationId || isReadOnlyMode}
              >
                <SelectTrigger
                  id="technician"
                  className={isReadOnlyMode ? "bg-muted" : ""}
                >
                  <SelectValue
                    placeholder={
                      selectedLocationId
                        ? "Seleccionar técnico"
                        : "Seleccione un taller primero"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {technicians?.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      No hay técnicos disponibles para esta ubicación
                    </div>
                  ) : (
                    technicians?.map(
                      (tech: {
                        id_usuario: string;
                        nombre_usuario: string;
                      }) => (
                        <SelectItem
                          key={tech.id_usuario}
                          value={tech.id_usuario}
                        >
                          {tech.nombre_usuario}
                        </SelectItem>
                      ),
                    )
                  )}
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
            <Label>Evidencia fotográfica</Label>
            <ImageUploadMulti
              onImagesChange={handleImagesChange}
              maxImages={10}
            />
          </div>

          <Button type="submit" className="w-full mt-4">
            Gestionar Garantía
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
