import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { HelpCircle } from 'lucide-react';

interface CountResult {
  referencia: string;
  nombre: string;
  cantidad_csa: number;
  cantidad_sistema: number;
  diferencia: number;
  existe_en_bd: boolean;
  existe_en_ubicacion: boolean;
}

export function ResultadosConteoPage() {
  const location = useLocation();
  const results: CountResult[] = location.state?.results || [];

  const getRowClass = (result: CountResult) => {
    if (!result.existe_en_bd) {
      return 'bg-red-500/20 hover:bg-red-500/30';
    }
    if (!result.existe_en_ubicacion) {
      return 'bg-orange-500/20 hover:bg-orange-500/30';
    }
    return '';
  };

  return (
    <div className="container mx-auto p-2 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold">Resultados del Conteo</h1>
        <Popover>
          <PopoverTrigger asChild>
            <button className="focus:outline-none mt-1">
              <HelpCircle className="h-6 w-6 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Leyenda de Colores</h4>
              </div>
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-primary">Rojo:</span> El producto no existe en la base de datos.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mt-1" />
                  <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-primary">Naranja:</span> El producto no se encontró en la ubicación esperada.
                  </p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Conteo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cant. Contada</TableHead>
                  <TableHead>Cant. Sistema</TableHead>
                  <TableHead>Diferencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length > 0 ? (
                  results.map((item) => (
                    <TableRow key={item.referencia} className={getRowClass(item)}>
                      <TableCell>{item.referencia}</TableCell>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell>{item.cantidad_csa}</TableCell>
                      <TableCell>{item.cantidad_sistema}</TableCell>
                      <TableCell>{item.diferencia}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay resultados para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
