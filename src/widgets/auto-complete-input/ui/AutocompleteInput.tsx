import { useState, useEffect } from "react";
import { Input } from "@/shared/ui/input";
import type { AutocompleteInputProps } from "../model/types";
import { useSearchSpares, type InventoryItem } from "@/entities/inventario";
import { Badge } from "@/shared/ui/badge";

export function AutocompleteInput({
  selected,
  setSelected,
  id_localizacion,
}: AutocompleteInputProps) {
  // Initialize query with selected name if available, otherwise empty string
  const [query, setQuery] = useState(selected?.nombre || "");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 2000); // 2000ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Sync local query state when selected prop changes externally
  // We check if the query is different to avoid unnecessary updates if it's already in sync
  useEffect(() => {
    if (selected && selected.nombre !== query) {
      // eslint-disable-next-line
      setQuery(selected.nombre);
    }
    // We intentionally do not reset query if selected becomes null,
    // as that usually happens when the user types (which sets selected to null).
    // If selected is cleared externally, we might want to clear query,
    // but the current logic in onChange handles the nulling.
  // eslint-disable-next-line
  }, [selected]); // Removed 'query' from deps to avoid circular loop, though logic handles it.

  // Use React Query hook for searching
  const { data: suggestions = [], isLoading } = useSearchSpares(
    debouncedQuery,
    !selected, // Only search if no item is selected
    id_localizacion || ""
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
          // Only clear selection if we actually have one
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
