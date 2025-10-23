import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../dc-pages/Home';
import MoviePage from '../dc-pages/MoviePage';
import TierList from '../dc-pages/TierList';
import '../dc-app.css';
import '../dc-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const numParticles = 100;
    const container = document.getElementById('dc-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      
      let size;
      if (i % 3 === 0) {
        size = 'small';
      } else if (i % 3 === 1) {
        size = 'medium';
      } else {
        size = 'large';
      }
      
      particle.className = `dc-particle ${size}`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = `-10px`;
      particle.style.animationDuration = `${8 + Math.random() * 12}s`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      
      container.appendChild(particle);
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
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div id="dc-background" className="dc-background"></div>
      
      <header style={{
        background: 'rgba(0, 0, 0, 0.8)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        padding: '12px 0',
        width: '100%',
        borderBottom: '2px solid #0078d4',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/dc-movies" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: '#0078d4',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <img src={`${process.env.PUBLIC_URL}/logos/dc-logo.png`} alt="DC" style={{ height: '30px' }} />
            DC Movies
          </Link>
          <nav style={{ display: 'flex', gap: '30px' }}>
            <Link to="/dc-movies" style={{ color: 'white', textDecoration: 'none', fontSize: '1rem' }}>Home</Link>
            <Link to="/dc-movies/tier-list" style={{ color: 'white', textDecoration: 'none', fontSize: '1rem' }}>Tier List</Link>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1rem' }}>← Back to Hub</Link>
          </nav>
        </div>
      </header>
      
      <main style={{ flex: 1, position: 'relative', zIndex: 0 }}>
        {children}
      </main>
    </div>
  );
};

function DCMovies() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="/tier-list" element={<TierList />} />
        <Route path="*" element={<Navigate to="/dc-movies" replace />} />
      </Routes>
    </Layout>
  );
}

export default DCMovies;
