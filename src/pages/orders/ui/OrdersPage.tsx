import { useState } from "react";
import { OrderFollowForm } from "./OrderFollowForm";
import { OrderFollowTable } from "./OrderFollowTable";
import { CallDetail } from "./CallDetail";

type View = "list" | "call-detail";

interface CallDetailState {
    orderId: number;
    orderNumber: number;
}

export function OrdersPage() {
    const [currentView, setCurrentView] = useState<View>("list");
    const [callDetailState, setCallDetailState] = useState<CallDetailState | null>(null);

    const handleCallClick = (orderId: number, orderNumber: number) => {
        setCallDetailState({ orderId, orderNumber });
        setCurrentView("call-detail");
    };

    const handleBackToList = () => {
        setCurrentView("list");
        setCallDetailState(null);
    };

    if (currentView === "call-detail" && callDetailState) {
        return (
            <div className="container mx-auto py-6 max-w-5xl">
                <CallDetail
                    orderId={callDetailState.orderId}
                    orderNumber={callDetailState.orderNumber}
                    onBack={handleBackToList}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Seguimiento de Órdenes</h1>

            <OrderFollowForm />

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Registros Recientes</h2>
                <OrderFollowTable onCallClick={handleCallClick} />
            </div>
        </div>
    )
}
