import React from 'react';
import { useEquifax } from '../hooks/useEquifax';
import { SearchForm } from '../components/SearchForm';
import { DemographicCard } from '../components/DemographicCard';

const Home = () => {
    const { userInfo, loading, error, searchByCedula, clearResults } = useEquifax();

    const handleSearch = (cedula) => {
        clearResults(); // Clear previous results before new search
        searchByCedula(cedula);
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Consulta Demográfica Happypay</h1>
                <p>Ingrese el número de cédula para consultar información.</p>
            </header>

            <main className="home-content">
                <SearchForm onSearch={handleSearch} loading={loading} />

                {error && (
                    <div className="alert-error">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <DemographicCard data={userInfo} />
            </main>

            <style jsx>{`
        .home-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .home-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .home-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: -webkit-linear-gradient(45deg, #090979, #00d4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .home-header p {
          color: #666;
          font-size: 1.1rem;
        }
        .alert-error {
          background-color: #fdf2f2;
          border: 1px solid #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1.5rem;
          text-align: center;
        }
      `}</style>
        </div>
    );
};

export default Home;
