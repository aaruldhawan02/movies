import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../marvel-pages/Home';
import MoviePage from '../marvel-pages/MoviePage';
import TierList from '../marvel-pages/TierList';
import CharacterEncyclopedia from '../marvel-pages/CharacterEncyclopedia';
import CharacterPage from '../marvel-pages/CharacterPage';
import '../marvel-pages/marvel-app.css';
import '../marvel-pages/marvel-theme.css';

const Layout = ({ children }) => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bangers&family=Roboto+Condensed:wght@400;700&display=swap';
    document.head.appendChild(link);
    
    const numParticles = 60;
    const container = document.getElementById('marvel-background');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      
      const colorClass = Math.random() > 0.5 
        ? (Math.random() > 0.5 ? 'blue' : 'gold') 
        : '';
      
      const sizeClass = Math.random() > 0.5 
        ? (Math.random() > 0.5 ? 'large' : 'small') 
        : '';
      
      particle.className = `marvel-particle ${colorClass} ${sizeClass}`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = `-10px`;
      
      const duration = 10 + Math.random() * 15;
      const delay = Math.random() * 10;
      const animationType = Math.random() > 0.5 ? 'float-up' : 'float-diagonal';
      
      particle.style.animationName = animationType;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      
      container.appendChild(particle);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: 'white',
      fontFamily: "'Roboto', 'Roboto Condensed', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div id="marvel-background" className="marvel-background" style={{ zIndex: 1 }}></div>
      
      <header style={{
        background: 'rgba(18, 18, 18, 0.95)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <Link to="/marvel-movies" style={{ textDecoration: 'none' }}>
          <img src={`${process.env.PUBLIC_URL}/logos/marvel-logo.svg`} alt="Marvel" style={{ height: '40px' }} />
        </Link>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/marvel-movies" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
          <Link to="/marvel-movies/tier-list" style={{ color: 'white', textDecoration: 'none' }}>Tier List</Link>
          <Link to="/marvel-movies/characters" style={{ color: 'white', textDecoration: 'none' }}>Characters</Link>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>← Back to Hub</Link>
        </nav>
      </header>
      
      <main style={{ flex: 1, position: 'relative', zIndex: 5 }}>
        {children}
      </main>
    </div>
  );
};

function MarvelMovies() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="/tier-list" element={<TierList />} />
        <Route path="/characters" element={<CharacterEncyclopedia />} />
        <Route path="/character/:characterName" element={<CharacterPage />} />
        <Route path="*" element={<Navigate to="/marvel-movies" replace />} />
      </Routes>
    </Layout>
  );
}

export default MarvelMovies;
