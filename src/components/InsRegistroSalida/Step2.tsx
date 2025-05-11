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
    const [minOdometro, setMinOdometro] = useState(0);

    const fetchLastOdometro = async (selectedPlaca: string) => {
        if (!selectedPlaca) {
            setLastOdometro(null);
            setMinOdometro(0);
            return;
        }

        setLoadingOdometro(true);
        try {
            const response = await axios.get(`${BASE_URL}/ins-registro-entrada/last-odometro`, {
                params: { placa: selectedPlaca }
            });
            const lastOdometroValue = response.data.lastOdometro || 0;
            setLastOdometro(lastOdometroValue);
            setMinOdometro(lastOdometroValue);

            if (odometroSalida && parseFloat(odometroSalida) < lastOdometroValue) {
              setOdometroSalida('');
            }   
        } catch (error) {
            console.error('Error al obtener odómetro:', error);
            setLastOdometro(null);
            setMinOdometro(0);
          } finally {
            setLoadingOdometro(false);
          }
    };

    useEffect(() => {
        const fetchPlacas = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/placas/get-data-placas`);

                console.log("Respuesta completa:", response);
                console.log("Datos recibidos:", response.data);
                console.log("Tipo de datos:", typeof response.data);
                
                let placas = [];

                // Caso 1: Si es un array directo
              if (Array.isArray(response.data)) {
                placas = response.data
                  .map(item => item?.toString().trim())
                  .filter(item => item && item.length > 0);
              } 
              // Caso 2: Si es un objeto con estructura {data: [...]}
              else if (response.data && Array.isArray(response.data.data)) {
                placas = response.data.data
                  .map(item => item?.toString().trim())
                  .filter(item => item && item.length > 0);
              }
              else {
                console.error('Formato de respuesta inesperado:', response.data);
                placas = ["PLACA1", "PLACA2", "PLACA3"]; // Datos de prueba
              }
        
              // 4. Eliminar duplicados
              const placasUnicas = [...new Set(placas)];
              
              console.log('Placas finales:', placasUnicas);
              setPlacasList(placasUnicas);             
                
            } catch (error) {
                console.error('Error al obtener placas:', error);
                // Datos de prueba para desarrollo
                setPlacasList(["PLACA1", "PLACA2", "PLACA3"]);
            } finally {
                setLoadingPlacas(false);
            }
        };

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

            <label className="block mb-4">
                Nombre del Conductor:
                <input
                    type="text"
                    value={conductor}
                    onChange={(e) => setConductor(e.target.value)}
                    className="mt-1 p-2 border rounded w-full"
                    required
                />
            </label>

            <label className="block mb-4">
                Tipo de Vehículo:
                <select
                    value={tipoVehiculo}
                    onChange={(e) => handleTipoVehiculoChange(e.target.value)}
                    className="mt-1 p-2 border rounded w-full"
                    required
                >
                    <option value="">Seleccione un tipo</option>
                    <option value="sedan">Sedán</option>
                    <option value="pickup">Pickup</option>
                    <option value="panel">Panel</option>
                    <option value="camion">Camión</option>
                </select>
            </label>

            <label className="block mb-4">
                Odómetro de Salida:
                <input
                    type="number"
                    min={minOdometro}
                    value={odometroSalida}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (!value || parseFloat(value) >= minOdometro) {
                            setOdometroSalida(value);
                        }
                    }}
                    className="mt-1 p-2 border rounded w-full"
                    required
                />
                {lastOdometro !== null && (
                    <p className="text-sm text-gray-500 mt-1">
                        Último registro: {lastOdometro} (Ingrese igual o mayor)
                    </p>
                )}
            </label>
            
            <div className="col-span-1 md:col-span-2 flex justify-between">
                <button 
                    type="button" 
                    className="bg-gray-500 text-white px-4 py-2 rounded" 
                    onClick={onPrevious}
                >
                    Atrás
                </button>
                <button 
                    type="button" 
                    className="bg-blue-500 text-white px-4 py-2 rounded" 
                    onClick={() => validateStep2() && onNext()}
                    disabled={loadingPlacas || loadingOdometro}
                >
                    {loadingOdometro ? 'Validando...' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
}

export default StepDos;
