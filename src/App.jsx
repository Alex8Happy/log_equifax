import React from 'react'
import Home from './pages/Home'

function App() {
  return (
    <div className="App">
      <Home />
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
