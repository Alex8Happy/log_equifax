// services/equifaxService.js

/**
 * Función principal para obtener el token válido.
 * Verifica el localStorage antes de hacer una petición de red.
 */
export const getEquifaxToken = async () => {
  const savedToken = localStorage.getItem('equifax_token');
  const savedDate = localStorage.getItem('token_date');
  
  // Obtenemos la fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Si el token existe y la fecha de guardado es hoy, lo retornamos
  if (savedToken && savedDate === today) {
    console.log("Usando token existente del localStorage");
    return savedToken;
  }

  // Si no hay token o ya caducó (es otro día), generamos uno nuevo
  console.log("Token no encontrado o caducado. Generando uno nuevo...");
  return await refreshEquifaxToken(today);
};

/**
 * Función interna que realiza la petición POST a Equifax
 */
const refreshEquifaxToken = async (todayDate) => {
  const myHeaders = new Headers();
  // Nota: Asegúrate de que estos valores sean los correctos según la doc de Equifax
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  // Generalmente la autenticación de token es Basic Auth con ClientID:Secret
  myHeaders.append("Authorization", "Basic eG4wVzVub3FreGgyelBmN2x2TjBRZklJdklhZ1BYejQ6NVZMRW5PSkIxV0FKclR1Vg==");

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
    const response = await fetch("https://api.latam.equifax.com/v2/oauth/token", requestOptions);
    const result = await response.json(); // Cambiamos .text() por .json() para manejar el objeto

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
