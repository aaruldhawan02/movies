import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../godzilla-pages/Home';
import MoviePage from '../godzilla-pages/MoviePage';
import '../godzilla-pages/godzilla-app.css';
import '../godzilla-pages/godzilla-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numLines = 25;
    const container = document.getElementById('godzilla-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numLines; i++) {
      const destructionLine = document.createElement('div');
      
      let size, orientation;
      if (i % 4 === 0) {
        size = 'small';
        orientation = 'horizontal';
      } else if (i % 4 === 1) {
        size = 'medium';
        orientation = 'horizontal';
      } else if (i % 4 === 2) {
        size = 'large';
        orientation = 'vertical';
      } else {
        size = 'medium';
        orientation = 'vertical';
      }
      
      destructionLine.className = `destruction-line ${size} ${orientation}`;
      
      if (orientation === 'horizontal') {
        destructionLine.style.top = `${Math.random() * 100}%`;
        destructionLine.style.left = `-100%`;
      } else {
        destructionLine.style.left = `${Math.random() * 100}%`;
        destructionLine.style.top = `-100%`;
      }
      
      destructionLine.style.animationDelay = `${Math.random() * 15}s`;
      
      container.appendChild(destructionLine);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: '#fff',
      fontFamily: "'Orbitron', monospace",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div id="godzilla-background" className="godzilla-background"></div>
      
      <header style={{
        background: 'rgba(0, 0, 0, 0.9)',
        boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)',
        padding: '16px 0',
        width: '100%',
        borderBottom: '3px solid #00ff00', zIndex: 9999,
        backdropFilter: 'blur(10px)', zIndex: 9999
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
            letterSpacing: '3px',
            color: '#00ff00',
            textShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
            textTransform: 'uppercase'
          }}>
            GODZILLA
          </div>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/godzilla" style={{ 
              color: '#00ff00',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>Home</Link>
            <Link to="/" style={{ 
              color: '#00ff00',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>← Back to Hub</Link>
          </nav>
        </div>
      </header>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 0', flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

function Godzilla() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/godzilla" replace />} />
      </Routes>
    </Layout>
  );
}

export default Godzilla;
