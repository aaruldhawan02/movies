import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../chipmunks-pages/Home';
import MoviePage from '../chipmunks-pages/MoviePage';
import '../chipmunks-pages/chipmunks-app.css';
import '../chipmunks-pages/chipmunks-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numAcorns = 12;
    const container = document.getElementById('chipmunks-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numAcorns; i++) {
      const acorn = document.createElement('div');
      
      let size;
      if (i % 3 === 0) {
        size = 'small';
      } else if (i % 3 === 1) {
        size = 'medium';
      } else {
        size = 'large';
      }
      
      acorn.className = `acorn ${size}`;
      acorn.style.top = `${Math.random() * 100}%`;
      acorn.style.left = `${Math.random() * 100 - 20}%`;
      acorn.style.animationDelay = `${Math.random() * 100}s`;
      
      container.appendChild(acorn);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: '#333',
      fontFamily: "'Comic Neue', cursive",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div id="chipmunks-background" className="chipmunks-background"></div>
      
      <header style={{
        background: 'linear-gradient(135deg, #8B4513, #D2691E)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        padding: '16px 0',
        width: '100%',
        borderBottom: '3px solid #FF6B6B', zIndex: 9999
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
            ALVIN AND THE CHIPMUNKS
          </div>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/chipmunks" style={{ 
              color: '#fff',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>Home</Link>
            <Link to="/" style={{ 
              color: '#fff',
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

function Chipmunks() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/chipmunks" replace />} />
      </Routes>
    </Layout>
  );
}

export default Chipmunks;
