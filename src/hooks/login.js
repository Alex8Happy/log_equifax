import { useState } from 'react';

export function useLogin(onLogin) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Por favor ingresa usuario y contraseña');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                '/auth-api/api/security/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                },
            );

            // Read text first to debug if it's not JSON (e.g. HTML error page)
            const textData = await response.text();
            console.log('Raw login response:', textData);

            let data;
            try {
                data = JSON.parse(textData);
            } catch (e) {
                throw new Error(`Server returned non-JSON response: ${textData.substring(0, 100)}...`);
            }

            console.log('Parsed login data:', data);

            if (data.success !== false) {
                // Success
                onLogin(username);
            } else {
                setError(data.message || 'Credenciales incorrectas');
            }
        } catch (err) {
            console.error('Login error:', err);
            // Show more detailed error for debugging
            setError(`Error de conexión: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return {
        username,
        setUsername,
        password,
        setPassword,
        error,
        loading,
        handleSubmit
    };
}