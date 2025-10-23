import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../despicable-me-pages/Home';
import MoviePage from '../despicable-me-pages/MoviePage';
import '../despicable-me-app.css';
import '../despicable-me-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numMinions = 12;
    const container = document.getElementById('despicable-me-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numMinions; i++) {
      const minion = document.createElement('div');
      
      let size;
      if (i % 3 === 0) {
        size = 'small';
      } else if (i % 3 === 1) {
        size = 'medium';
      } else {
        size = 'large';
      }
      
      minion.className = `minion ${size}`;
      minion.style.top = `${Math.random() * 100}%`;
      minion.style.left = `${Math.random() * 100 - 20}%`;
      minion.style.animationDelay = `${Math.random() * 100}s`;
      
      container.appendChild(minion);
    }

    const numLairElements = 8;
    for (let i = 0; i < numLairElements; i++) {
      const element = document.createElement('div');
      element.className = 'lair-element';
      
      const size = 20 + Math.random() * 40;
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.top = `${Math.random() * 100}%`;
      element.style.left = `${Math.random() * 100}%`;
      element.style.animationDelay = `${Math.random() * 4}s`;
      
      container.appendChild(element);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div id="despicable-me-background" className="despicable-me-background"></div>
      
      <header className="despicable-header" style={{
        background: 'linear-gradient(135deg, #333, #555)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        padding: '12px 0',
        width: '100%',
        borderBottom: '4px solid #FFD700'
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
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            letterSpacing: '1px',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            textTransform: 'uppercase'
          }}>
            DESPICABLE ME
          </div>
          <Link to="/" style={{ 
            color: '#FFD700',
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

function DespicableMe() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/despicable-me" replace />} />
      </Routes>
    </Layout>
  );
}

export default DespicableMe;
