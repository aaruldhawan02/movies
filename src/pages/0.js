import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../chipmunks-pages/Home';
import MoviePage from '../chipmunks-pages/MoviePage';
import '../chipmunks-app.css';

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
          <Link to="/chipmunks" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: '#0078d4',
            textDecoration: 'none'
          }}>
            0
          </Link>
          <nav style={{ display: 'flex', gap: '30px' }}>
            <Link to="/chipmunks" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>← Back to Hub</Link>
          </nav>
        </div>
      </header>
      
      <main style={{ flex: 1, position: 'relative', zIndex: 0 }}>
        {children}
      </main>
    </div>
  );
};

function 0() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieTitle" element={<MoviePage />} />
        <Route path="*" element={<Navigate to="/chipmunks" replace />} />
      </Routes>
    </Layout>
  );
}

export default 0;
