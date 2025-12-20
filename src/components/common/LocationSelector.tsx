import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import type { UserLocation } from '@/types/common-types';

export function LocationSelector() {
    const { currentLocation, setCurrentLocation, isAuthenticated, sessionData } = useUserStore();
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const savedLocationId = localStorage.getItem('minca_location_id');

    useEffect(() => {
        const initLocation = async () => {
            if (!isAuthenticated || !sessionData?.user?.id) return;
            if (savedLocationId && !currentLocation) {
                try {
                    const { data, error } = await supabase
                        .from('localizacion')
                        .select('id_localizacion, nombre')
                        .eq('id_localizacion', savedLocationId)
                        .single();


                    if (data && !error) {
                        setCurrentLocation(data);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error('Error restoring location:', e);
                    localStorage.removeItem('minca_location_id');
                }
            }

            // 2. If no saved location or already set, fetch available locations for user
            if (!savedLocationId) {
                try {
                    // Get location IDs for user
                    const { data: userLocs, error: userLocsError } = await supabase
                        .from('usuarios_localizacion')
                        .select('id_localizacion')
                        .eq('id_usuario', sessionData.user.id);

                    if (userLocsError) throw userLocsError;

                    if (userLocs && userLocs.length > 0) {
                        const locationIds = userLocs.map(l => l.id_localizacion);

                        // Get location details
                        const { data: locs, error: locsError } = await supabase
                            .from('localizacion')
                            .select('id_localizacion, nombre')
                            .in('id_localizacion', locationIds);

                        if (locsError) throw locsError;
                        setLocations(locs || []);
                    } else {
                        setLocations([]);
                    }
                } catch (error) {
                    console.error('Error fetching locations:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        initLocation();
    }, [isAuthenticated, currentLocation, sessionData?.user?.id, setCurrentLocation, savedLocationId]);

    const handleSelectLocation = (location: UserLocation) => {
        localStorage.setItem('minca_location_id', location.id_localizacion.toString());
        setCurrentLocation(location);
    };

    if ((!isAuthenticated || currentLocation) && savedLocationId) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 shadow-lg border-2">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Selecciona una ubicación</CardTitle>
                    <CardDescription>
                        Para continuar, por favor selecciona la ubicación donde te encuentras.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 max-h-[60vh] overflow-y-auto p-6 pt-0">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No tienes ubicaciones asignadas. Contacta al administrador.
                        </div>
                    ) : (
                        locations.map((location) => (
                            <Button
                                key={location.id_localizacion}
                                variant="outline"
                                className="w-full justify-start text-lg py-6 hover:border-primary hover:bg-primary/5 transition-all"
                                onClick={() => handleSelectLocation(location)}
                            >
                                <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
                                {location.nombre}
                            </Button>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
