/**
 * Equifax Service
 * Handles all direct communication with the Equifax API.
 */

// --- Token Logic ---

/**
 * Función principal para obtener el token válido.
 * Verifica la expiración real del token en localStorage.
 */
const getEquifaxToken = async () => {
    const savedToken = localStorage.getItem('equifax_token');
    const expirationTime = localStorage.getItem('token_expiration'); // Timestamp en milisegundos

    const now = Date.now();
    // Buffer de seguridad de 5 minutos (300,000 ms) para evitar usar un token a punto de vencer
    const safetyBuffer = 5 * 60 * 1000;

    // Verificar si existe token y si aún es válido (Current Time < Expiration - Buffer)
    if (savedToken && expirationTime && (now < (parseInt(expirationTime) - safetyBuffer))) {
        // console.log("Usando token válido del caché");
        return savedToken;
    }

    console.log("Token expirado o inexistente. Generando uno nuevo...");
    return await refreshEquifaxToken();
};

/**
 * Función interna que realiza la petición POST a Equifax para renovar el token
 */
const refreshEquifaxToken = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const basicAuth = import.meta.env.VITE_EQUIFAX_BASIC_AUTH;
    if (!basicAuth) {
        console.error("VITE_EQUIFAX_BASIC_AUTH no está definido en el archivo .env");
    }
    myHeaders.append("Authorization", basicAuth || "");

    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "client_credentials");
    urlencoded.append("scope", "https://api.latam.equifax.com/business/interconnect/v1/decision-orchestrations");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    try {
        const response = await fetch("/api_proxy/v2/oauth/token", requestOptions);
        if (!response.ok) {
            throw new Error(`Token Request failed with status ${response.status}`);
        }
        const result = await response.json();

        if (result.access_token) {
            // Guardamos el token
            localStorage.setItem('equifax_token', result.access_token);

            // Calculamos expiración. OAuth suele devolver 'expires_in' en segundos.
            // Si no viene, asumimos 1 hora (3600s) por defecto.
            const expiresInSeconds = result.expires_in || 3600;
            const expirationTimestamp = Date.now() + (expiresInSeconds * 1000);
            localStorage.setItem('token_expiration', expirationTimestamp.toString());

            return result.access_token;
        } else {
            throw new Error("No se pudo obtener el access_token de la respuesta");
        }
    } catch (error) {
        console.error("Error al renovar el token de Equifax:", error);
        throw error;
    }
};

// --- Data Fetching Logic ---

/**
 * Obtiene la información demográfica de una persona dada su cédula.
 * @param {string} cedula - El número de documento (Cédula)
 * @returns {Promise<Object>} - La respuesta de Equifax
 */
export const getDemographicInfo = async (cedula) => {
    if (!cedula) throw new Error("Cédula es requerida");

    // Helper to perform the fetch
    const fetchInfo = async (tokenToUse) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${tokenToUse}`);

        const raw = JSON.stringify({
            "applicants": {
                "primaryConsumer": {
                    "personalInformation": {
                        "tipoDocumento": "C",
                        "numeroDocumento": cedula
                    }
                }
            },
            "productData": {
                "customer": "ECICHAPPYPAY",
                "model": "HAPPYPAY",
                "configuration": "Config",
                "billTo": "EC004002B001",
                "shipTo": "EC004002B001S001"
            }
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const response = await fetch("/api_proxy/business/interconnect/v1/decision-orchestrations/execute?", requestOptions);
        return response;
    };

    try {
        let token = await getEquifaxToken();
        let response = await fetchInfo(token);

        // Si falla por Auth (401), intentamos refrescar el token forzosamente y reintentar
        if (response.status === 401) {
            console.warn("Recibido 401 Unauthorized. Intentando refrescar token...");

            // Borramos expiración para forzar renovación (aunque llamemos directo a refresh)
            localStorage.removeItem('token_expiration');
            token = await refreshEquifaxToken();

            // Reintento con token nuevo
            response = await fetchInfo(token);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("Error en getDemographicInfo:", error);
        throw error;
    }
};
