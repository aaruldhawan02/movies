import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../transformers-pages/Home';
import MoviePage from '../transformers-pages/MoviePage';
import '../transformers-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numLines = 25;
    const container = document.getElementById('transformers-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numLines; i++) {
      const line = document.createElement('div');
      
      const isVertical = Math.random() > 0.5;
      const sizeClass = Math.random() > 0.66 ? 'large' : Math.random() > 0.33 ? 'medium' : 'small';
      
      if (isVertical) {
        line.className = `tech-line vertical ${sizeClass}`;
        line.style.left = `${Math.random() * 100}%`;
      } else {
        line.className = `tech-line horizontal ${sizeClass}`;
        line.style.top = `${Math.random() * 100}%`;
      }
      
      line.style.animationDelay = `${Math.random() * 8}s`;
      
      container.appendChild(line);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      fontFamily: "'Roboto', 'Arial', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div id="transformers-background" className="transformers-background" style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>
      
      <header style={{
        background: 'rgba(0, 0, 0, 0.9)',
        boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
        padding: '16px 0',
        width: '100%',
        borderBottom: '2px solid #00d4ff',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/transformers" style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            letterSpacing: '3px',
            background: 'linear-gradient(45deg, #00d4ff, #ff6b00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
            textDecoration: 'none'
          }}>
            TRANSFORMERS
          </Link>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link to="/transformers" style={{ 
              fontWeight: '500',
              color: '#00d4ff',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              padding: '8px 12px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Home</Link>
            <Link to="/" style={{ 
              fontWeight: '500',
              color: '#00d4ff',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              padding: '8px 12px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>← Movie Hub</Link>
          </nav>
        </div>
      </header>
      
      <main style={{ 
        flex: 1, 
        position: 'relative', 
        zIndex: 5,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        width: '100%'
      }}>
        {children}
      </main>
    </div>
  );
};

function Transformers() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/transformers" replace />} />
      </Routes>
    </Layout>
  );
}

export default Transformers;
