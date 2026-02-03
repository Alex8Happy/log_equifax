import React from 'react';

export const DemographicCard = ({ data }) => {
  if (!data) return null;

  // Helper to extract or fallback data safely
  // La estructura exacta de la respuesta de Equifax puede variar, 
  // aquí intentamos mostrar todo lo que venga en un formato legible
  // o campos específicos si los conocemos.

  // Por ahora, mostraremos el JSON formateado bonito y si encontramos campos comunes los destacamos.

  console.log("Datos recibidos en DemographicCard:", data);

  // Data Extraction Helpers
  // Intentamos encontrar 'informacion_demografica' en varios posibles niveles
  const infoDemograficaArray = data?.informacion_demografica ||
    data?.información_demografica ||
    data?.decisionOrchestration?.result?.informacion_demografica ||
    data?.decisionOrchestration?.result?.información_demografica ||
    data?.reporteCrediticio?.informacion_demografica ||
    data?.reporteCrediticio?.información_demografica ||
    [];

  const infoDirecta = infoDemograficaArray[0] || {};

  // Fallback a la lógica anterior si no se encuentra el array específico
  const applications = data?.decisionOrchestration?.application || data?.decisionOrchestration?.result?.application;
  const consumers = applications?.applicants?.primaryConsumer || {};
  const personalInfo = consumers?.personalInformation || {};
  const addresses = consumers?.addresses || [];
  const contacts = consumers?.contactInformation || [];

  // Extracting specific fields (Prioridad: infoDirecta -> personalInfo)
  const fechaNacimiento = infoDirecta.fecha_nacimiento || personalInfo.fechaNacimiento || personalInfo.FechaNacimiento;
  const educacion = infoDirecta.educacion || personalInfo.nivelEstudio || personalInfo.NivelEstudio || personalInfo.educationLevel;

  // Address / Location
  const provincia = infoDirecta.provincia || (addresses[0]?.state || addresses[0]?.provincia);
  const canton = infoDirecta.canton || (addresses[0]?.city || addresses[0]?.canton);
  const direccion = infoDirecta.direcciones || (addresses[0]?.addressLine1 || addresses[0]?.callePrincipal);
  const lat = infoDirecta.coordenada_x || (addresses[0]?.latitude); // Nota: coincidencia de nombre puede variar
  const long = infoDirecta.coordenada_y || (addresses[0]?.longitude);

  // Contact extraction
  // El usuario mostró llaves directas 'numero_telefonico_convencional'
  const phoneHome = infoDirecta.numero_telefonico_convencional || contacts.find(c => ['HomePhone', 'Domicilio'].includes(c.contactType))?.number;
  const phoneCell = infoDirecta.numero_telefonico_celular || contacts.find(c => ['MobilePhone', 'Celular'].includes(c.contactType))?.number;

  // Format Helpers
  const formatValue = (val) => (val && val !== "null" && val.trim() !== "") ? val : "Sin Dato.";
  // Para coordenadas y pipes, el usuario quería ver "||||" si estaba vacío
  const formatCoords = (val) => (val && val !== "null" && val.trim() !== "") ? val : "Sin Dato.";
  const formatPipe = (val) => (val && val !== "null" && val.trim() !== "") ? val : "Sin Dato.";

  const renderItem = (label, value, isPipe = false) => (
    <div className="data-item">
      <span className="label">{label}</span>
      <span className="value">{isPipe ? value : formatValue(value)}</span>
    </div>
  );

  return (
    <div className="demographic-card">
      <h3 className="card-title">Información Demográfica</h3>

      {/* Siempre renderizamos la estructura */}
      <div className="grid-layout">
        {renderItem("Fecha Nacimiento", fechaNacimiento)}
        {renderItem("Educación", educacion)}
        {renderItem("Provincia", formatPipe(provincia), true)}
        {renderItem("Cantón", formatPipe(canton), true)}
        {renderItem("Direcciones", formatPipe(direccion), true)}
        {renderItem("Coordenada X", formatCoords(lat), true)}
        {renderItem("Coordenada Y", formatCoords(long), true)}
        {renderItem("Teléfono Convencional", phoneHome || "Sin Dato Disponible.")}
        {renderItem("Teléfono Celular", phoneCell || "" , true)}
      </div>



      {/* Debug View - Restored for diagnosis */}
      <details className="debug-details">
        <summary>Ver respuesta cruda (Debug)</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </details>

      <style jsx>{`
        .demographic-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #eaeaea;
          padding: 2rem;
          margin-top: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          animation: slideUp 0.4s ease-out;
        }
        .card-title {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          color: #111;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.5rem;
        }
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .data-item {
          display: flex;
          flex-direction: column;
        }
        .label {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .value {
          font-size: 1.1rem;
          font-weight: 500;
          color: #000;
        }
        .empty {
          color: #bbb;
          font-style: italic;
          font-size: 0.9rem;
        }
        .raw-data pre {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.85rem;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .debug-details {
          margin-top: 2rem;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1rem;
        }
        .debug-details summary {
          cursor: pointer;
          color: #0070f3;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .debug-details pre {
          background: #333;
          color: #fff;
          padding: 1rem;
          border-radius: 6px;
          overflow: auto;
          font-size: 0.8rem;
          max-height: 400px;
        }
      `}</style>
    </div>
  );
};
