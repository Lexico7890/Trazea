import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useSearchRepuestos } from "../hooks/use-inventory";
import type { InventoryItem } from "@/features/inventory/types";
import { Badge } from "./ui/badge";

interface AutocompleteInputProps {
  selected?: { id_repuesto: string, referencia: string, nombre: string } | null;
  setSelected: (selection: { id_repuesto: string, referencia: string, nombre: string } | null) => void;
}

export default function AutocompleteInput({
  selected,
  setSelected,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 2000); // 2000ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Use React Query hook for searching
  const { data: suggestions = [], isLoading } = useSearchRepuestos(
    debouncedQuery,
    !selected // Only search if no item is selected
  );

  // When the user selects a suggestion
  const handleSelect = (item: InventoryItem) => {
    setSelected({ id_repuesto: item.id_repuesto, referencia: item.referencia, nombre: item.nombre });
    setQuery(item.nombre);
  };

  return (
    <div className="relative w-full mx-auto">
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        placeholder="Escribe para buscar..."
        className="w-full p-4 dark:text-white focus:ring-2 focus:ring-neon-blue-500 focus:border-transparent resize-none transition-all duration-300 placeholder-gray-500"
      />

      {isLoading && (
        <div className="absolute z-40 left-0 right-0 border mt-1 p-2 rounded-lg bg-secondary">
          Buscando...
        </div>
      )}

      {(!isLoading && suggestions.length > 0 && !selected) && (
        <ul className="absolute bg-secondary z-40 left-0 right-0 border rounded-lg mt-1 max-h-60 overflow-y-auto shadow">
          {suggestions.map((item) => (
            <li
              key={item.id_repuesto || item.referencia}
              className="p-2 cursor-pointer hover:bg-red-600"
              onClick={() => handleSelect(item)}
            >
              {item.nombre}
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <Badge className="absolute top-10 right-0" variant="secondary">Ref: {selected.referencia}</Badge>
      )}
    </div>
  );
}