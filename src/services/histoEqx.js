export const getHistoEqx = async (cedula) => {
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    try {
        const response = await fetch(`/api/histo-eqx/api/apisidesoft/EquifaxConsulta/${cedula}`, requestOptions);
        if (!response.ok) {
            throw new Error(`HistoEqx API Error ${response.status}`);
        }
        const histoData = await response.json();
        return histoData;
    } catch (error) {
        console.error("Error in getHistoEqx:", error);
        throw error;
    }
}