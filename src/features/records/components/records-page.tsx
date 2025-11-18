import MovementsWorkshopForm from "./movements-workshop-form";

export default function RecordsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Registros</h1>
      <p>Esta es la página de registros.</p>
      <div className="lg:grid lg:grid-cols-2 gap-4 mt-4 flex flex-col">
        <section className="flex justify-center items-center p-4">
          <MovementsWorkshopForm />
        </section>
        <section className="flex justify-center items-center p-4">
          <p>Lista de movimientos</p>
        </section>
      </div>
    </div>
  );
}
