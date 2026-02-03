/**
 * Equifax Service
 * Handles all direct communication with the Equifax API.
 */

// --- Token Logic ---

/**
 * Función principal para obtener el token válido.
 * Verifica el localStorage antes de hacer una petición de red.
 */
const getEquifaxToken = async () => {
    const savedToken = localStorage.getItem('equifax_token');
    const savedDate = localStorage.getItem('token_date');

    // Obtenemos la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Si el token existe y la fecha de guardado es hoy, lo retornamos
    if (savedToken && savedDate === today) {
        // console.log("Usando token existente del localStorage");
        return savedToken;
    }

    // Si no hay token o ya caducó (es otro día), generamos uno nuevo
    console.log("Token no encontrado o caducado. Generando uno nuevo...");
    return await refreshEquifaxToken(today);
};

/**
 * Función interna que realiza la petición POST a Equifax para renovar el token
 */
const refreshEquifaxToken = async (todayDate) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    // Generalmente la autenticación de token es Basic Auth con ClientID:Secret
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
            // Guardamos el token y la fecha de hoy
            localStorage.setItem('equifax_token', result.access_token);
            localStorage.setItem('token_date', todayDate);
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

    try {
        const token = await getEquifaxToken();

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

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
