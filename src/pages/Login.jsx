import { useLogin } from '../hooks/login';
import './Login.css';

export default function Login({ onLogin }) {
    const {
        username,
        setUsername,
        password,
        setPassword,
        error,
        loading,
        handleSubmit
    } = useLogin(onLogin);

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Bienvenido</h1>
                <p className="login-subtitle">Inicia sesión para continuar</p>

                {error && <div className="error-message">{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Correo Electrónico / Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-field"
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}
