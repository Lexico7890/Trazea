export interface AutocompleteInputProps {
    selected?: { id_repuesto: string, referencia: string, nombre: string } | null;
    setSelected: (selection: { id_repuesto: string, referencia: string, nombre: string } | null) => void;
    id_localizacion: string | undefined;
}