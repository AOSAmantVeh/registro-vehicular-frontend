import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/validation/url';

type Step2Props = {
    placa: string;
    setPlaca: (value: string) => void;
    conductor: string;
    setConductor: (value: string) => void;
    tipoVehiculo: string;
    setTipoVehiculo: (value: string) => void;
    odometroSalida: string;
    setOdometroSalida: (value: string) => void;
    onPrevious: () => void;
    onNext: () => void;
    datos: string[];
    actualizarLlantasPorTipo: (tipo: string) => void;
}

function StepDos({ 
    placa, 
    setPlaca, 
    conductor, 
    setConductor, 
    tipoVehiculo, 
    setTipoVehiculo, 
    odometroSalida, 
    setOdometroSalida, 
    onPrevious, 
    onNext, 
    datos, 
    actualizarLlantasPorTipo 
}: Step2Props) {
    const [loadingOdometro, setLoadingOdometro] = useState(false);
    const [placasList, setPlacasList] = useState<string[]>([]);
    const [loadingPlacas, setLoadingPlacas] = useState(true);
    const [lastOdometro, setLastOdometro] = useState<number | null>(null);

    const fetchLastOdometro = async (selectedPlaca: string) => {
        if (!selectedPlaca) {
            setLastOdometro(null);
            return;
        }

        setLoadingOdometro(true);
        try {
            const response = await axios.get<{lastOdometro: number}>(`${BASE_URL}/ins-registro-entrada/last-odometro`, {
                params: { placa: selectedPlaca }
            });
            setLastOdometro(response.data.lastOdometro || 0);
        } catch (error) {
            console.error('Error al obtener odómetro:', error);
            setLastOdometro(null);
        } finally {
            setLoadingOdometro(false);
        }
    };

    const fetchPlacas = async () => {
        try {
            const response = await axios.get<string[]>(`${BASE_URL}/placas/get-data-placas`);
            
            // Procesamiento seguro de la respuesta
            let placas: string[] = [];
            
            if (Array.isArray(response.data)) {
                placas = response.data;
            } else if (response.data && typeof response.data === 'object') {
                // Si viene como objeto, extraer los valores
                placas = Object.values(response.data).flat() as string[];
            }
            
            // Limpieza y filtrado
            const placasLimpias = placas
                .map(item => item?.toString().trim())
                .filter(item => item && item.length > 0);
            
            // Eliminar duplicados
            const placasUnicas = [...new Set(placasLimpias)];
            setPlacasList(placasUnicas);
            
        } catch (error) {
            console.error('Error al obtener placas:', error);
            setPlacasList(["PLACA1", "PLACA2", "PLACA3"]); // Datos de fallback
        } finally {
            setLoadingPlacas(false);
        }
    };

    useEffect(() => {
        fetchPlacas();
    }, []);

    useEffect(() => {
        if (placa) {
            fetchLastOdometro(placa);
        }
    }, [placa]);

    const validateStep2 = () => {
        if (!placa || !conductor || !tipoVehiculo || !odometroSalida) {
            alert("Todos los campos son obligatorios");
            return false;
        }

        const odometroValue = Number(odometroSalida);
        if (isNaN(odometroValue) || odometroValue < 0) {
            alert("Odómetro debe ser un número positivo");
            return false;
        }

        if (lastOdometro !== null && odometroValue < lastOdometro) {
            alert(`El odómetro no puede ser menor al último registro (${lastOdometro})`);
            return false;
        }

        return true;
    };

    const handleTipoVehiculoChange = (value: string) => {
        setTipoVehiculo(value);
        actualizarLlantasPorTipo(value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block mb-4">
                Placa del Vehículo:
                <select
                    value={placa}
                    onChange={(e) => {
                        setPlaca(e.target.value);
                        fetchLastOdometro(e.target.value);
                    }}
                    className="mt-1 p-2 border rounded w-full"
                    required
                    disabled={loadingPlacas}
                >
                    {loadingPlacas ? (
                        <option value="">Cargando placas...</option>
                    ) : placasList.length === 0 ? (
                        <option value="" disabled>No hay placas registradas</option>
                    ) : (
                        <>
                            <option value="">Seleccione una placa</option>
                            {placasList.map((placaItem, index) => (
                                <option key={`${placaItem}-${index}`} value={placaItem}>
                                    {placaItem}
                                </option>
                            ))}
                        </>
                    )}
                </select>
            </label>

            {/* Resto de tu JSX permanece igual */}
            {/* ... */}
        </div>
    );
}

export default StepDos;
