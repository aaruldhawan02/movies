import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../fast-pages/Home';
import MoviePage from '../fast-pages/MoviePage';
import '../fast-app.css';
import '../fast-theme.css';

const Layout = ({ children }) => {
  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: 'white',
      fontFamily: "'Roboto', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    }}>
      <header style={{
        background: 'rgba(0, 0, 0, 0.8)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        padding: '12px 0',
        width: '100%',
        borderBottom: '2px solid #ff3838',
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
          <Link to="/fast-saga" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: '#ff3838',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            Fast & Furious Saga
          </Link>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link to="/fast-saga" style={{ 
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
      
      <main style={{ flex: 1, position: 'relative', zIndex: 0 }}>
        {children}
      </main>
    </div>
  );
};

function FastSaga() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/fast-saga" replace />} />
      </Routes>
    </Layout>
  );
}

export default FastSaga;
