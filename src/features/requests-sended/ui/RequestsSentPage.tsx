import { useEffect, useState } from "react";
import { getReceivedRequests, type ReceivedRequest } from "../api";
import { useUserStore } from "@/entities/user";
import { ProcessRequestModal } from "./ProcessRequestModal";
import { toast } from "sonner";
import { Package, Calendar, Clock, MapPin } from "lucide-react";

export function RequestsSentPage() {
    const { currentLocation } = useUserStore();
    const [requests, setRequests] = useState<ReceivedRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [selectedRequest, setSelectedRequest] = useState<ReceivedRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadRequests = async () => {
        if (!currentLocation?.id_localizacion) return;
        setIsLoading(true);
        try {
            const data = await getReceivedRequests(String(currentLocation.id_localizacion));
            setRequests(data);
        } catch {
            toast.error("Error al cargar las solicitudes enviadas");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [currentLocation]);

    const handleCardClick = (req: ReceivedRequest) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 md:p-6 w-full max-w-7xl mx-auto min-h-[80vh] flex flex-col">
            <h1 className="text-3xl font-bold orbitron-title text-white mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                Solicitudes Recibidas
            </h1>
            
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="animate-pulse text-zinc-400">Cargando solicitudes...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900/40 rounded-2xl border border-zinc-800/50 p-8 text-center shadow-lg">
                    <Package className="w-16 h-16 text-zinc-600 mb-4" />
                    <h3 className="text-xl font-medium text-zinc-300">No hay solicitudes</h3>
                    <p className="text-zinc-500 mt-2">Aún no te han enviado solicitudes de repuestos desde otras sedes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                    {requests.map(req => {
                        const isPending = req.estado === 'pendiente';
                        
                        return (
                            <div 
                                key={req.id_solicitud}
                                onClick={() => handleCardClick(req)}
                                className={`
                                    relative overflow-hidden p-5 rounded-2xl cursor-pointer
                                    transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]
                                    border backdrop-blur-md
                                    ${isPending 
                                        ? 'border-red-500/40 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:border-red-500/80' 
                                        : 'border-green-500/40 bg-green-950/20 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:border-green-500/80'
                                    }
                                `}
                            >
                                {/* Decorative Neon Accent Line */}
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${isPending ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-green-500 shadow-[0_0_15px_#22c55e]'}`} />
                                
                                <div className="flex justify-between items-start mb-5 pt-2">
                                    <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${isPending ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                                        {req.estado}
                                    </span>
                                    <span className="text-zinc-400 text-xs flex items-center gap-1.5 font-mono">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(req.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2 drop-shadow-md">
                                    <MapPin className={`w-5 h-5 ${isPending ? 'text-red-400' : 'text-green-400'}`} />
                                    {req.origen?.nombre || 'Taller Origen'}
                                </h3>
                                
                                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-5">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(req.fecha_creacion).toLocaleDateString()}</span>
                                </div>
                                
                                <div className="mt-2 pt-4 border-t border-zinc-800 flex justify-between items-center">
                                    <span className="text-sm font-medium text-zinc-300">
                                        {req.items?.length || 0} repuestos solicitados
                                    </span>
                                    <div className={`p-2 rounded-full ${isPending ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'} shadow-inner`}>
                                        <Package className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <ProcessRequestModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
                onSuccess={loadRequests}
            />
        </div>
    );
}
