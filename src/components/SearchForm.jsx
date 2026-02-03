import { useState } from 'react';

export const SearchForm = ({ onSearch, loading }) => {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');

  const validateCedula = (value) => {
    if (!value) return "La cédula es requerida";
    if (!/^\d{10}$/.test(value)) return "La cédula debe tener 10 dígitos numéricos";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errorMsg = validateCedula(cedula);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError('');
    onSearch(cedula);
  };

  return (
    <div className="card-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="cedula" className="form-label">Número de Cédula</label>
          <div className="input-group">
            <input
              type="text"
              id="cedula"
              value={cedula}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); // Solo números
                if (val.length <= 10) setCedula(val);
                if (error) setError('');
              }}
              placeholder="Ingrese 10 dígitos"
              className={`form-input ${error ? 'error' : ''}`}
              disabled={loading}
            />
            <button
              type="submit"
              className={`btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                "Consultar"
              )}
            </button>
          </div>
          {error && <span className="error-message">{error}</span>}
        </div>
      </form>

      <style jsx>{`
        .card-container {
          background: #ffffff;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          width: 100%;
        }
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        .input-group {
          display: flex;
          gap: 10px;
        }
        .form-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: #0070f3;
          outline: none;
        }
        .form-input.error {
          border-color: #e00;
        }
        .btn-primary {
          padding: 0 24px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-primary:hover {
          background: #005bb5;
        }
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .error-message {
          color: #e00;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: block;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
