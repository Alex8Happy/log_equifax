import React, { useState } from 'react';

export const DemographicCard = ({ data }) => {
  if (!data) return null;

  // Debug log
  console.log("Datos recibidos en DemographicCard:", data);

  // --- Data Extraction Logic ---
  // Try to find 'informacion_demografica' (accented or not, array or object)
  const infoDemograficaArray = data?.informacion_demografica ||
    data?.información_demografica ||
    data?.decisionOrchestration?.result?.informacion_demografica ||
    data?.decisionOrchestration?.result?.información_demografica ||
    data?.reporteCrediticio?.informacion_demografica ||
    data?.reporteCrediticio?.información_demografica ||
    [];

  // Normalize: If it's an array, take first item, else treat as object
  const infoDirecta = Array.isArray(infoDemograficaArray) ? (infoDemograficaArray[0] || {}) : infoDemograficaArray;

  // Fallback paths
  const applications = data?.decisionOrchestration?.application || data?.decisionOrchestration?.result?.application;
  const consumers = applications?.applicants?.primaryConsumer || {};
  const personalInfo = consumers?.personalInformation || {};
  const addresses = consumers?.addresses || [];
  const contacts = consumers?.contactInformation || [];

  // Extract fields (Priority: infoDirecta -> personalInfo)
  const fechaNacimiento = infoDirecta.fecha_nacimiento || personalInfo.fechaNacimiento || personalInfo.FechaNacimiento;
  const educacion = infoDirecta.educacion || personalInfo.nivelEstudio || personalInfo.NivelEstudio || personalInfo.educationLevel;

  // Location / Addresses
  // Prefer infoDirecta fields, fallback to address array
  const provincia = infoDirecta.provincia || (addresses[0]?.state || addresses[0]?.provincia);
  const canton = infoDirecta.canton || (addresses[0]?.city || addresses[0]?.canton);
  const direccion = infoDirecta.direcciones || (addresses[0]?.addressLine1 || addresses[0]?.callePrincipal);

  // Coords
  const lat = infoDirecta.coordenada_x || (addresses[0]?.latitude);
  const long = infoDirecta.coordenada_y || (addresses[0]?.longitude);

  // Phones
  const phoneHome = infoDirecta.numero_telefonico_convencional || contacts.find(c => ['HomePhone', 'Domicilio'].includes(c.contactType))?.number;
  const phoneCell = infoDirecta.numero_telefonico_celular || contacts.find(c => ['MobilePhone', 'Celular'].includes(c.contactType))?.number;


  // --- Helper Functions ---

  // Split pipe-separated string into array
  const parsePipe = (val) => {
    if (!val || val === "null" || val === "Sin Dato." || val === "||||") return [];
    // Split by pipe, filter empty or purely whitespace or single pipe chars
    return val.split('|').filter(item => item && item.trim() !== "" && item !== "|");
  };

  const formatSingle = (val) => (val && val !== "null" && val.trim() !== "") ? val : "Sin Dato";

  // Process data for rendering
  const educacionVal = formatSingle(educacion);
  const provinciaList = parsePipe(provincia);
  const cantonList = parsePipe(canton);
  const direccionList = parsePipe(direccion);
  const latList = parsePipe(lat);
  const longList = parsePipe(long);
  const cellList = parsePipe(phoneCell);
  const homeList = parsePipe(phoneHome);

  // --- Copy Logic ---
  const [copiedItem, setCopiedItem] = useState(null);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedItem(text);
      setTimeout(() => setCopiedItem(null), 2000); // Reset after 2s
    });
  };

  // --- Render Helpers ---

  const renderChips = (list, colorClass = "chip-default", allowCopy = false) => {
    if (list.length === 0) return <span className="empty-text">Sin Dato</span>;
    return (
      <div className="chip-container">
        {list.map((item, idx) => {
          const isCopied = copiedItem === item;
          return (
            <span
              key={idx}
              className={`chip ${colorClass} ${allowCopy ? 'chip-clickable' : ''}`}
              onClick={allowCopy ? () => handleCopy(item) : undefined}
              title={allowCopy ? "Click para copiar" : undefined}
            >
              {item}
              {allowCopy && (
                <span className="copy-icon">
                  {isCopied ? '✅' : '📋'}
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  const renderSection = (title, content, fullWidth = false) => (
    <div className={`section-item ${fullWidth ? 'full-width' : ''}`}>
      <span className="label">{title}</span>
      <div className="content-wrapper">{content}</div>
    </div>
  );

  return (
    <div className="demographic-card">
      <div className="card-header">
        <h3 className="card-title">Información Demográfica</h3>
        <span className="badge-verified">Verificado</span>
      </div>

      <div className="main-grid">

        {/* Row 1 (MOVED TO TOP): Contacts */}
        <div className="full-width-container contacts-section-top">
          <span className="label section-header">Contactos (Click para copiar)</span>
          <div className="contacts-grid">
            {renderSection("Teléfono Convencional", renderChips(homeList, "chip-green", true))}
            {renderSection("Teléfono Celular", renderChips(cellList, "chip-green", true))}
          </div>
        </div>

        {/* Row 2: Basic Info */}
        {renderSection("Fecha Nacimiento", <span className="value-text">{formatSingle(fechaNacimiento)}</span>)}
        {renderSection("Educación", <span className="value-text">{educacionVal}</span>)}

        {/* Row 3: Regions (Chips) */}
        {renderSection("Provincia", renderChips(provinciaList, "chip-blue"))}
        {renderSection("Cantón", renderChips(cantonList, "chip-blue"))}

        {/* Row 4: Addresses (Full Width) */}
        <div className="full-width-container">
          <span className="label">Direcciones</span>
          {direccionList.length > 0 ? (
            <ul className="address-list">
              {direccionList.map((addr, i) => (
                <li key={i} className="address-item">
                  <div className="address-icon">📍</div>
                  <div className="address-content">
                    <div className="address-text">{addr}</div>
                    {/* Attempt to show coord for this address index if available */}
                    {(latList[i] || longList[i]) && (
                      <div className="coords-tag">
                        {latList[i] || "?"}, {longList[i] || "?"}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : <span className="empty-text">Sin direcciones registradas</span>}
        </div>

      </div>

      {/* Debug View */}
      {/*<details className="debug-details">
        <summary>Ver respuesta cruda (Debug)</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </details>*/}

      <style jsx>{`
        .demographic-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #f0f0f0;
          padding: 2rem;
          margin-top: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          animation: slideUp 0.5s ease-out;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 1rem;
        }
        .card-title {
          margin: 0;
          font-size: 1.4rem;
          color: #1a1a1a;
          font-weight: 700;
        }
        .badge-verified {
          background: #e6f7ff;
          color: #0070f3;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .main-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
        }
        .section-item {
          display: flex;
          flex-direction: column;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        
        .label {
          font-size: 0.75rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }
        /* Special style for contacts header */
        .contacts-section-top {
            margin-top: 0 !important; /* Override full-width margin because it's first now */
            padding-top: 0 !important;
            border-top: none !important;
            margin-bottom: 1rem;
        }
        
        .value-text {
          font-size: 1.1rem;
          color: #222;
          font-weight: 500;
        }
        .empty-text {
          color: #ccc;
          font-style: italic;
          font-size: 0.95rem;
        }

        /* Chips */
        .chip-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }
        .chip {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          background: #f5f5f5;
          color: #444;
          border: 1px solid #eee;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .chip:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .chip-clickable {
            cursor: pointer;
            padding-right: 8px;
        }
        .chip-clickable:hover {
            background-color: #e6fffa;
            border-color: #b7eb8f;
        }
        .copy-icon {
            font-size: 0.8rem;
            opacity: 0.7;
        }

        .chip-blue { background: #f0f9ff; color: #026aa7; border-color: #bae7ff; }
        .chip-green { background: #f6ffed; color: #389e0d; border-color: #d9f7be; }


        /* Full Width Containers */
        .full-width-container {
          grid-column: 1 / -1;
          margin-top: 0.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #fafafa;
        }

        /* Addresses */
        .address-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 1rem;
        }
        .address-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          background: #fafafa;
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          transition: border-color 0.2s;
        }
        .address-item:hover {
            border-color: #e0e0e0;
        }
        .address-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .address-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .address-text {
          line-height: 1.5;
          color: #333;
          font-size: 0.95rem;
        }
        .coords-tag {
          font-size: 0.75rem;
          background: #eef2f5;
          padding: 3px 8px;
          border-radius: 6px;
          color: #555;
          white-space: nowrap;
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .coords-tag:before {
            content: '🗺️';
            font-size: 0.7rem;
        }

        /* Contacts Grid inside container */
        .contacts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 2rem;
        }

        /* Debug */
        .debug-details {
          margin-top: 4rem;
          padding-top: 1rem;
          border-top: 1px dashed #eee;
        }
        .debug-details summary {
          color: #bbb;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .debug-details pre {
          background: #222;
          color: #dedede;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          max-height: 300px;
          overflow: auto;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
