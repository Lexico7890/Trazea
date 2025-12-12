import ListMovements from "./list-movements";
import MovementsWorkshopForm from "./movements-workshop-form";

export default function RecordsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Registros</h1>
      <p>Esta es la página de registros.</p>
      <div className="gap-4 mt-4 flex flex-col">
        <section className="flex justify-center items-center p-4">
          <MovementsWorkshopForm />
        </section>
        <section className="flex justify-center items-center p-4">
          <ListMovements />
        </section>
      </div>
    </div>
  );
}
