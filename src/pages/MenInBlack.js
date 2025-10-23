import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../meninblack-pages/Home';
import MoviePage from '../meninblack-pages/MoviePage';
import '../meninblack-app.css';
import '../meninblack-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numLines = 15;
    const container = document.getElementById('meninblack-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numLines; i++) {
      const surveillanceLine = document.createElement('div');
      
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
      
      surveillanceLine.className = `surveillance-line ${size} ${orientation}`;
      
      if (orientation === 'horizontal') {
        surveillanceLine.style.top = `${Math.random() * 100}%`;
        surveillanceLine.style.left = `-100%`;
      } else {
        surveillanceLine.style.left = `${Math.random() * 100}%`;
        surveillanceLine.style.top = `-100%`;
      }
      
      surveillanceLine.style.animationDelay = `${Math.random() * 12}s`;
      
      container.appendChild(surveillanceLine);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: '#fff',
      fontFamily: "'Courier New', 'Arial', monospace",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div id="meninblack-background" className="meninblack-background"></div>
      
      <header style={{
        background: 'rgba(0, 0, 0, 0.95)',
        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
        padding: '16px 0',
        width: '100%',
        borderBottom: '2px solid #ffffff',
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
            letterSpacing: '3px',
            background: 'linear-gradient(45deg, #ffffff, #c0c0c0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            fontFamily: "'Courier New', monospace"
          }}>
            MEN IN BLACK
          </div>
          <Link to="/" style={{ 
            color: '#ffffff',
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

function MenInBlack() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/meninblack" replace />} />
      </Routes>
    </Layout>
  );
}

export default MenInBlack;
