import React, { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Home user={user} onLogout={handleLogout} />
      )}

      {/* Global CSS Reset helper if needed, though usually in index.css */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #fafafa;
          color: #333;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

export default App
