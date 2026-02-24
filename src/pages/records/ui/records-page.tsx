import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useUserStore } from "@/entities/user";
import { MovementsWorkshopForm } from "@/features/record-save-movement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import ListMovements from "./list-movements";
import { GuaranteesForm } from "@/features/guarantees-create";
import { GuaranteesDashboard } from "@/features/guarantees-dashboard";

interface LocationState {
  defaultTab?: string;
  // agrega aquí otras propiedades que pases por state
}

export function RecordsPage() {
  const { checkMenuPermission } = useUserStore();
  const showForm = checkMenuPermission("registros", "show_form_register");
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const state = location.state as LocationState | null;
  const [activeTab, setActiveTab] = useState(state?.defaultTab ?? "registros");

  const handleSendWarranty = (data: unknown) => {
    console.log("RecordsPage received warranty to send:", data);
    setSelectedWarranty(data);

    // Optional: scroll to top to see form if needed, or ensuring tab is open
    // Since form is above dashboard in the layout:
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Registros</h1>
      <p>Esta es la página de registros.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="registros">Registros</TabsTrigger>
          <TabsTrigger value="garantias">Garantías</TabsTrigger>
        </TabsList>

        <TabsContent value="registros">
          <div className="gap-4 mt-4 flex flex-col">
            {showForm && (
              <section className="flex justify-center items-center p-0 md:p-4">
                <MovementsWorkshopForm />
              </section>
            )}
            <section className="flex justify-center items-center p-0 md:p-4">
              <ListMovements />
            </section>
          </div>
        </TabsContent>

        <TabsContent value="garantias">
          <div className="mt-4 flex flex-col items-center">
            <GuaranteesForm prefillData={selectedWarranty} />
            <GuaranteesDashboard onSendWarranty={handleSendWarranty} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
