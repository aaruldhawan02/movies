import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../pixar-pages/Home';
import MoviePage from '../pixar-pages/MoviePage';
import '../pixar-pages/pixar-app.css';
import '../pixar-pages/pixar-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numClouds = 15;
    const container = document.getElementById('pixar-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numClouds; i++) {
      const cloud = document.createElement('div');
      
      let size;
      if (i % 3 === 0) {
        size = 'small';
      } else if (i % 3 === 1) {
        size = 'medium';
      } else {
        size = 'large';
      }
      
      cloud.className = `cloud ${size}`;
      cloud.style.top = `${Math.random() * 100}%`;
      cloud.style.left = `${Math.random() * 100 - 20}%`;
      cloud.style.animationDelay = `${Math.random() * 100}s`;
      
      container.appendChild(cloud);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: '#333',
      fontFamily: "'Fredoka One', cursive",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div id="pixar-background" className="pixar-background"></div>
      
      <header style={{
        background: 'linear-gradient(135deg, #87CEEB, #4682B4)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        padding: '12px 0',
        width: '100%',
        borderBottom: '3px solid #FFD700', zIndex: 9999
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            textTransform: 'uppercase'
          }}>
            PIXAR
          </div>
          <Link to="/" style={{ 
            color: '#fff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>← Back to Hub</Link>
        </div>
      </header>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 0', flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

function Pixar() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/pixar" replace />} />
      </Routes>
    </Layout>
  );
}

export default Pixar;
