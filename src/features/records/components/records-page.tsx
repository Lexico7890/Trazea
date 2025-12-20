import ListMovements from "./list-movements";
import MovementsWorkshopForm from "./movements-workshop-form";
import GuaranteesForm from "./GuaranteesForm";
import GuaranteesDashboard from "./GuaranteesDashboard";
import { useUserStore } from "@/store/useUserStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RecordsPage() {
  const { checkMenuPermission } = useUserStore();
  const showForm = checkMenuPermission("registros", "show_form_register");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Registros</h1>
      <p>Esta es la página de registros.</p>

      <Tabs defaultValue="registros" className="mt-4">
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
            <GuaranteesForm />
            <GuaranteesDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
