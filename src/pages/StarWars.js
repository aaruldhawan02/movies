import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../star-wars-pages/Home';
import MoviePage from '../star-wars-pages/MoviePage';
import '../star-wars-app.css';
import '../starfield.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numStars = 500; // Increased from 300
    const numSmallStars = 300; // Increased from 200
    const container = document.getElementById('starfield');
    if (!container) return;

    container.innerHTML = '';

    // Create regular stars
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      container.appendChild(star);
    }

    // Create smaller stars
    for (let i = 0; i < numSmallStars; i++) {
      const smallStar = document.createElement('div');
      smallStar.className = 'star small';
      smallStar.style.left = `${Math.random() * 100}%`;
      smallStar.style.top = `${Math.random() * 100}%`;
      smallStar.style.animationDelay = `${Math.random() * 4}s`;
      container.appendChild(smallStar);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: 'white',
      fontFamily: "'Roboto', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div id="starfield" className="starfield" style={{ zIndex: 1 }}></div>
      
      <header style={{
        background: 'rgba(0, 0, 0, 0.8)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        padding: '12px 0',
        width: '100%',
        borderBottom: '2px solid #ffd700',
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
          <Link to="/star-wars" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            letterSpacing: '1px',
            color: '#FFE81F',
            textDecoration: 'none'
          }}>
            STAR WARS
          </Link>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link to="/star-wars" style={{ 
              fontWeight: '500',
              color: '#FFE81F',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              padding: '8px 12px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Home</Link>
            <Link to="/" style={{ 
              fontWeight: '500',
              color: '#FFE81F',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              padding: '8px 12px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>← Movie Hub</Link>
          </nav>
        </div>
      </header>
      
      <main style={{ flex: 1, position: 'relative', zIndex: 5 }}>
        {children}
      </main>
    </div>
  );
};

function StarWars() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/star-wars" replace />} />
      </Routes>
    </Layout>
  );
}

export default StarWars;
