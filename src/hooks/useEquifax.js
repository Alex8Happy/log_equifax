import { useState, useCallback } from 'react';
import { getDemographicInfo } from '../services/equifaxService';

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
