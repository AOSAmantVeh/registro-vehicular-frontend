// components/InsRegistroSalida/Variables/Variables2.tsx
import { useState } from 'react';
import { Llanta } from '@/types/llantas';

function Variables2() {
  // 1. Definir llantasBase como constante primero
  const llantasBase: Llanta[] = [
    { id: 1, nombre: 'Llanta Delantera Izquierda', fp: false, pe: false, pa: false, desgaste: false },
    { id: 2, nombre: 'Llanta Delantera Derecha', fp: false, pe: false, pa: false, desgaste: false },
    { id: 5, nombre: 'Llanta Trasera Izquierda', fp: false, pe: false, pa: false, desgaste: false },
    { id: 6, nombre: 'Llanta Extra Trasera Izquierda (Solo Camión)', fp: false, pe: false, pa: false, desgaste: false },
    { id: 7, nombre: 'Llanta Trasera Derecha', fp: false, pe: false, pa: false, desgaste: false },
    { id: 8, nombre: 'Llanta Extra Trasera Derecha (Solo Camión)', fp: false, pe: false, pa: false, desgaste: false }
  ];

  // 2. Inicializar estados usando llantasBase
  const [llantasParte1, setLlantasParte1] = useState<Llanta[]>(llantasBase.slice(0, 5));
  const [llantasParte2, setLlantasParte2] = useState<Llanta[]>(llantasBase.slice(5, 10));
  const [observacionGeneralLlantas, setObservacionGeneralLlantas] = useState('');

  // 3. Definir la función una sola vez con tipos explícitos
  const actualizarLlantasPorTipo = (tipoVehiculo: string): void => {
    if (tipoVehiculo === 'camion') {
      setLlantasParte1(llantasBase.filter(llanta => [1, 2, 5, 6].includes(llanta.id)));
      setLlantasParte2(llantasBase.filter(llanta => [7, 8].includes(llanta.id)));
    } else {
      setLlantasParte1(llantasBase.filter(llanta => [1, 2].includes(llanta.id)));
      setLlantasParte2(llantasBase.filter(llanta => [5, 7].includes(llanta.id)));
    }
  };

  return {
    llantasParte1,
    setLlantasParte1,
    llantasParte2,
    setLlantasParte2,
    observacionGeneralLlantas,
    setObservacionGeneralLlantas,
    actualizarLlantasPorTipo
  };
}

export default Variables2;
