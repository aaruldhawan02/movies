import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../mission-impossible-pages/Home';
import MoviePage from '../mission-impossible-pages/MoviePage';
import '../mission-impossible-theme.css';

function MissionImpossible() {
  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0a0a0a',
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(192, 0, 0, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(192, 0, 0, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(192, 0, 0, 0.05) 0%, transparent 50%)
      `,
      color: 'white',
      fontFamily: "'Roboto', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <header style={{
        background: 'linear-gradient(45deg, #c00000, #a00000)',
        boxShadow: '0 4px 15px rgba(192, 0, 0, 0.3)',
        padding: '12px 0',
        width: '100%',
        borderBottom: '1px solid rgba(192, 0, 0, 0.3)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/mission-impossible" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            color: 'white',
            textDecoration: 'none'
          }}>
            Mission Impossible
          </Link>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link to="/mission-impossible" style={{ 
              fontWeight: '500',
              color: 'white',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              padding: '8px 12px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Home</Link>
            <Link to="/" style={{ 
              fontWeight: '500',
              color: 'white',
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px',
        width: '100%',
        flex: '1'
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:movieTitle" element={<MoviePage />} />
          <Route path="*" element={<Navigate to="/mission-impossible" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default MissionImpossible;
