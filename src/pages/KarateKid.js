import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../karate-kid-pages/Home';
import MoviePage from '../karate-kid-pages/MoviePage';
import '../karate-kid-app.css';
import '../karate-kid-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numElements = 12;
    const container = document.getElementById('karate-kid-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numElements; i++) {
      const element = document.createElement('div');
      
      let size, elementType;
      if (i % 4 === 0) {
        size = 'small';
        elementType = 'yin-yang';
      } else if (i % 4 === 1) {
        size = 'medium';
        elementType = 'yin-yang';
      } else {
        size = 'large';
        elementType = 'yin-yang';
      }
      
      element.className = `martial-element ${size} ${elementType}`;
      element.style.top = `${Math.random() * 100}%`;
      element.style.left = `${Math.random() * 100 - 20}%`;
      element.style.animationDelay = `${Math.random() * 120}s`;
      
      container.appendChild(element);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: '#fff',
      fontFamily: "'Noto Sans JP', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div id="karate-kid-background" className="karate-kid-background"></div>
      
      <header style={{
        background: 'rgba(139, 0, 0, 0.95)',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
        padding: '16px 0',
        width: '100%',
        borderBottom: '3px solid #ffd700',
        backdropFilter: 'blur(10px)'
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
            letterSpacing: '2px',
            color: '#ffd700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
            textTransform: 'uppercase'
          }}>
            KARATE KID
          </div>
          <Link to="/" style={{ 
            color: '#ffd700',
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

function KarateKid() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/karate-kid" replace />} />
      </Routes>
    </Layout>
  );
}

export default KarateKid;
