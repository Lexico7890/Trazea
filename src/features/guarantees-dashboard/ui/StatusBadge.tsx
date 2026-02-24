import { Badge } from "@/shared/ui/badge";

interface StatusBadgeProps {
  status: string | undefined;
}

const statusStyles: Record<string, string> = {
  'sin enviar': 'bg-orange-500 text-white border-transparent shadow-[0_0_12px_-3px_rgba(249,115,22,0.8)] hover:bg-orange-600 hover:shadow-[0_0_15px_-3px_rgba(249,115,22,1)] transition-all',
  'pendiente': 'bg-blue-500 text-white border-transparent shadow-[0_0_12px_-3px_rgba(59,130,246,0.8)] hover:bg-blue-600 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,1)] transition-all',
  'aprobada': 'bg-green-500 text-white border-transparent shadow-[0_0_12px_-3px_rgba(34,197,94,0.8)] hover:bg-green-600 hover:shadow-[0_0_15px_-3px_rgba(34,197,94,1)] transition-all',
  'aprobado': 'bg-green-500 text-white border-transparent shadow-[0_0_12px_-3px_rgba(34,197,94,0.8)] hover:bg-green-600 hover:shadow-[0_0_15px_-3px_rgba(34,197,94,1)] transition-all',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const lowerStatus = status?.toLowerCase() || '';
  const customClass = statusStyles[lowerStatus] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <Badge variant="outline" className={`uppercase text-[10px] ${customClass}`}>
      {status}
    </Badge>
  );
}
