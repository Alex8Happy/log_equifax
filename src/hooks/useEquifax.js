import { useState, useCallback } from 'react';
import { getDemographicInfo } from '../services/equifaxService';
import { getHistoEqx } from '../services/histoEqx';

/**
 * Custom hook to interact with Equifax Service
 */
export const useEquifax = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchByCedula = useCallback(async (cedula) => {
        setLoading(true);
        setError(null);
        setUserInfo(null);

        try {
            // 1. Intentar obtener datos históricos primero
            try {
                const histoResponse = await getHistoEqx(cedula);
                console.log("Respuesta HistoEqx Completa:", histoResponse);

                // La respuesta viene anidada en datos.respuesta
                const histoData = histoResponse?.datos?.respuesta;

                if (!histoData) {
                    console.warn("No se encontraron datos históricos válidos (estructura vacía o incorrecta).");
                    // Lanzamos error para ir al catch y activar el fallback
                    throw new Error("Datos históricos vacíos");
                }

                console.log("Datos Históricos Extrais dos (histoData):", histoData);

                // Extraer infoDirecta usando la misma lógica que en DemographicCard
                const infoDemograficaArray = histoData?.informacion_demografica ||
                    histoData?.información_demografica ||
                    histoData?.decisionOrchestration?.result?.informacion_demografica ||
                    histoData?.decisionOrchestration?.result?.información_demografica ||
                    histoData?.reporteCrediticio?.informacion_demografica ||
                    histoData?.reporteCrediticio?.información_demografica ||
                    [];

                const infoDirecta = Array.isArray(infoDemograficaArray) ? (infoDemograficaArray[0] || {}) : infoDemograficaArray;

                // Helper para validar teléfono (maneja separadores de pipe ||)
                const isValidPhone = (phoneStr) => {
                    if (!phoneStr) return false;
                    // Dividir por pipe, limpiar espacios y filtrar vacíos
                    const parts = phoneStr.split('|').map(p => p.trim()).filter(p => p.length > 0);
                    // Verificar si alguno tiene >= 8 dígitos
                    const hasValidNumber = parts.some(p => p.length >= 8);
                    return hasValidNumber;
                };

                // Verificar si existe infoDirecta y tiene un celular válido
                const phone = infoDirecta?.numero_telefonico_celular;
                console.log("Teléfono extraído:", phone);

                if (isValidPhone(phone)) {
                    console.log("Datos históricos válidos encontrados (celular OK), usando histoEqx.");
                    setUserInfo(histoData); // Guardamos la data desempaquetada
                    return; // Terminamos aquí si encontramos datos válidos
                }
                console.log("Datos históricos encontrados pero sin celular válido, consultando Equifax...");
            } catch (histoError) {
                console.warn("Validación historial fallida:", histoError.message);
                // No lanzamos el error, simplemente continuamos al fallback
            }

            // 2. Fallback a Equifax Service si no hay históricos válidos
            const data = await getDemographicInfo(cedula);
            setUserInfo(data);

        } catch (err) {
            setError(err.message || "Error al consultar Equifax");
        } finally {
            setLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setUserInfo(null);
        setError(null);
    }, []);

    return {
        userInfo,
        loading,
        error,
        searchByCedula,
        clearResults
    };
};
