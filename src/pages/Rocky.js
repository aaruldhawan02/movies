import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../rocky-pages/Home';
import MoviePage from '../rocky-pages/MoviePage';
import '../rocky-pages/rocky-app.css';
import '../rocky-pages/rocky-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numElements = 10;
    const container = document.getElementById('rocky-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numElements; i++) {
      const element = document.createElement('div');
      
      let size, elementType;
      if (i % 3 === 0) {
        size = 'small';
        elementType = 'boxing-glove';
      } else if (i % 3 === 1) {
        size = 'medium';
        elementType = 'boxing-glove';
      } else {
        size = 'large';
        elementType = 'boxing-glove';
      }
      
      element.className = `boxing-element ${size} ${elementType}`;
      element.style.top = `${Math.random() * 100}%`;
      element.style.left = `${Math.random() * 100 - 20}%`;
      element.style.animationDelay = `${Math.random() * 100}s`;
      
      container.appendChild(element);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: '#fff',
      fontFamily: "'Bebas Neue', cursive",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div id="rocky-background" className="rocky-background"></div>
      
      <header style={{
        background: 'linear-gradient(135deg, #8B0000, #DC143C)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        padding: '16px 0',
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
            fontSize: '2rem', 
            fontWeight: 'bold',
            letterSpacing: '3px',
            color: '#FFD700',
            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',
            textTransform: 'uppercase'
          }}>
            ROCKY
          </div>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/rocky" style={{ 
              color: '#FFD700',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>Home</Link>
            <Link to="/" style={{ 
              color: '#FFD700',
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

function Rocky() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/rocky" replace />} />
      </Routes>
    </Layout>
  );
}

export default Rocky;
