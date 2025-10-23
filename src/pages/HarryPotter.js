import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../harrypotter-pages/Home';
import MoviePage from '../harrypotter-pages/MoviePage';
import '../harrypotter-app.css';
import '../harrypotter-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numMagicElements = 30;
    const numLightning = 8;
    const container = document.getElementById('harrypotter-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numMagicElements; i++) {
      const magicElement = document.createElement('div');
      
      let size;
      if (i % 4 === 0) {
        size = 'small';
      } else if (i % 4 === 1) {
        size = 'medium';
      } else if (i % 4 === 2) {
        size = 'large';
      } else {
        size = 'medium';
      }
      
      magicElement.className = `magic-element ${size}`;
      magicElement.style.left = `${Math.random() * 100}%`;
      magicElement.style.animationDelay = `${Math.random() * 6}s`;
      
      container.appendChild(magicElement);
    }

    for (let i = 0; i < numLightning; i++) {
      const lightning = document.createElement('div');
      lightning.className = 'lightning-bolt';
      lightning.style.left = `${Math.random() * 100}%`;
      lightning.style.animationDelay = `${Math.random() * 8}s`;
      
      container.appendChild(lightning);
    }

    const castle = document.createElement('div');
    castle.className = 'castle-silhouette';
    container.appendChild(castle);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: '#fff',
      fontFamily: "'Cinzel', 'Georgia', serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div id="harrypotter-background" className="harrypotter-background"></div>
      
      <header style={{
        background: 'rgba(0, 0, 0, 0.9)',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
        padding: '16px 0',
        width: '100%',
        borderBottom: '2px solid #ffd700',
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
            background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
            fontFamily: "'Cinzel', serif"
          }}>
            HARRY POTTER
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

function HarryPotter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/harrypotter" replace />} />
      </Routes>
    </Layout>
  );
}

export default HarryPotter;
