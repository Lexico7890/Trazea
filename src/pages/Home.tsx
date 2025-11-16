import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Sistema de Inventario Minca</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/productos"
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Productos</h2>
          <p className="text-gray-600">Gestiona el catálogo de productos</p>
        </Link>

        <Link
          to="/inventario"
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Inventario</h2>
          <p className="text-gray-600">Controla el stock y movimientos</p>
        </Link>
      </div>
    </div>
  );
}
