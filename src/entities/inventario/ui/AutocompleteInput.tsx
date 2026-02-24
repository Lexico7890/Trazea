import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import type { AutocompleteInputProps, InventoryItem } from "../model/types";
import { useSearchSpares } from "../lib/useSearchSpares";

// Exporta este tipo para que los componentes padres lo usen
export interface AutocompleteInputRef {
  clear: () => void;
}

export const AutocompleteInput = forwardRef<
  AutocompleteInputRef,
  AutocompleteInputProps
>((props, ref) => {
  const {
    selected,
    setSelected,
    id_localizacion,
    searchSource = "inventory",
    showBadge = true,
    clearInput = false,
  } = props;
  const [query, setQuery] = useState(selected?.nombre || "");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Expone el método clear al componente padre
  useImperativeHandle(ref, () => ({
    clear: () => {
      setQuery("");
      setDebouncedQuery(""); // ✅ Agrega esta línea
    },
  }));

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 2000);

    return () => clearTimeout(timer);
  }, [query]);

  // Use React Query hook for searching
  const { data: suggestions = [], isLoading } = useSearchSpares(
    debouncedQuery,
    !selected && debouncedQuery.length > 0, // ✅ Solo busca si hay texto
    searchSource === "inventory" ? id_localizacion || "" : "",
  );

  // When the user selects a suggestion
  const handleSelect = (item: InventoryItem) => {
    setSelected({
      id_repuesto: item.id_repuesto,
      referencia: item.referencia,
      nombre: item.nombre,
    });
    if (clearInput) {
      setQuery("");
    } else {  
      setQuery(item.nombre);
    }
  };

  return (
    <div className="relative w-full mx-auto">
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (selected) {
            setSelected(null);
          }
        }}
        placeholder="Escribe para buscar..."
        className="w-full p-4 dark:text-white focus:ring-2 focus:ring-neon-blue-500 focus:border-transparent resize-none transition-all duration-300 placeholder-gray-500"
      />

      {isLoading && (
        <div className="absolute z-40 left-0 right-0 border mt-1 p-2 rounded-lg bg-secondary">
          Buscando...
        </div>
      )}

      {!isLoading &&
        suggestions.length > 0 &&
        !selected &&
        query.length > 0 && (
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

      {selected && showBadge && (
        <Badge className="absolute top-10 right-0" variant="secondary">
          Ref: {selected.referencia}
        </Badge>
      )}
    </div>
  );
});

AutocompleteInput.displayName = "AutocompleteInput";
