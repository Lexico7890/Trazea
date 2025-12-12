import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="text-muted-foreground max-w-[500px]">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
          Por favor verifica la URL o regresa al inicio.
        </p>
      </div>
      <Link to="/">
        <Button size="lg" className="font-semibold">
          Volver al Inicio
        </Button>
      </Link>
    </div>
  );
}
