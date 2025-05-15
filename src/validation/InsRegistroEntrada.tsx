import axios from 'axios';
import { Revision } from '../components/InsRegistroEntrada/Variables/Variables1';
import { BASE_URL } from './url';

export const handleSubmit = async (
    e: React.FormEvent,
    formData: { revisiones: any[]; observacion: string; odometro: string },
    setIsSubmitting: (value: boolean) => void,
    setFormData: (data: { revisiones: any[]; observacion: string; odometro: string }) => void,
    navigate: (path: string) => void
) => {
    e.preventDefault();

    try {
        // Validación de campos completos
        const allFilled = formData.revisiones.every(item => item.opcion !== null);
        if (!allFilled) {
            throw new Error("Por favor, selecciona una opción en todas las revisiones");
        }

        // Validación de odómetro
        const odometroNum = Number(formData.odometro);
        if (isNaN(odometroNum) || odometroNum < 0) {
            throw new Error("El odómetro debe ser un número válido");
        }

        setIsSubmitting(true);
        
        const lastPlacaInfo = localStorage.getItem('lastPlacaInfo');
        if (!lastPlacaInfo) {
            throw new Error('No se encontró información del vehículo');
        }

        const response = await axios.post(
            `${BASE_URL}/ins-registro-entrada/register`,
            {
                revisiones: formData.revisiones,
                observacion: formData.observacion,
                odometro: formData.odometro,
                lastPlacaInfo: lastPlacaInfo
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.data.message) {
            alert(response.data.message);
            // Resetear formulario
            setFormData({
                revisiones: formData.revisiones.map(item => ({
                    ...item,
                    opcion: null
                })),
                observacion: '',
                odometro: ''
            });
            localStorage.removeItem('lastPlacaInfo');
            navigate('/');
        }
    } catch (error: any) {
        alert(error.message || 'Error al registrar los datos');
        console.error('Error:', error);
    } finally {
        setIsSubmitting(false);
    }
};
