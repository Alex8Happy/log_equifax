import { useEquifax } from '../hooks/useEquifax';
import { SearchForm } from '../components/SearchForm';
import { DemographicCard } from '../components/DemographicCard';

const Home = ({ onLogout }) => {
  const { userInfo, loading, error, searchByCedula, clearResults } = useEquifax();

  const handleSearch = (cedula) => {
    clearResults(); // Clear previous results before new search
    searchByCedula(cedula);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div>
            <h1>Consulta Demográfica Happypay</h1>
            <p>Ingrese el número de cédula para consultar información.</p>
          </div>
          <button onClick={onLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <aside className="sidebar">
          <SearchForm onSearch={handleSearch} loading={loading} />

          {error && (
            <div className="alert-error">
              <strong>Error:</strong> {error}
            </div>
          )}
        </aside>

        <main className="main-content">
          <div className="results-wrapper">
            {/* Show card if data exists, or placeholder state */}
            {userInfo ? (
              <DemographicCard data={userInfo} />
            ) : (
              !loading && (
                <div className="placeholder-state">
                  <span className="icon">🔍</span>
                  <p>Los resultados de la consulta aparecerán aquí</p>
                </div>
              )
            )}

            {/* Keep loading state separate or inside card if preferred, but here is clean */}
          </div>
        </main>
      </div>

      <style jsx>{`
        .home-container {
          max-width: 1900px;
          margin: 0 auto;
          padding: 1rem;
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
        }

        @media (min-width: 768px) {
          .home-container {
            padding: 2rem;
          }
        }
        
        .home-header {
          margin-bottom: 2.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .home-header h1 {
          font-size: 1.8rem;
          margin: 0 0 0.5rem 0;
          color: #111;
          font-weight: 700;
        }
        .home-header p {
          color: #666;
          margin: 0;
          font-size: 1rem;
        }
        .logout-button {
          background-color: transparent;
          color: #666;
          border: 1px solid #ddd;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .logout-button:hover {
          background-color: #f5f5f5;
          color: #333;
          border-color: #ccc;
        }

        /* Dashboard Grid Layout */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        /* Desktop Layout */
        @media (min-width: 900px) {
          .dashboard-grid {
             /* Previous grid columns removed to keep vertical stacking */
             /* grid-template-columns: 350px 1fr; */
             display: flex;
             flex-direction: column;
             max-width: 900px;
             margin: 0 auto;
          }
          .sidebar {
            /* Changed to static or keep sticky but top works differently if stacked, usually static is better for stacked form */
            position: static;
            width: 100%;
          }
        }

        .alert-error {
          background-color: #fff1f0;
          border: 1px solid #ffccc7;
          color: #cf1322;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .placeholder-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          background: #f9f9f9;
          border-radius: 12px;
          border: 2px dashed #e0e0e0;
          color: #999;
          margin-top: 0;
          height: 100%;
          min-height: 300px;
        }
        .placeholder-state .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default Home;
