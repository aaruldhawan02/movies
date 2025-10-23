import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from '../theboys-pages/Home';
import ShowPage from '../theboys-pages/ShowPage';
import '../cityscape.css';

function TheBoys() {
  useEffect(() => {
    const createCityscape = () => {
      const container = document.getElementById('cityscape');
      if (!container) return;

      container.innerHTML = '';

      // Create buildings
      const numBuildings = 15;
      for (let i = 0; i < numBuildings; i++) {
        const building = document.createElement('div');
        building.className = 'building';
        
        const height = Math.random() * 200 + 100; // 100-300px height
        const width = Math.random() * 80 + 40; // 40-120px width
        
        building.style.width = `${width}px`;
        building.style.height = `${height}px`;
        building.style.left = `${(i / numBuildings) * 100}%`;
        building.style.backgroundColor = `rgba(${Math.random() * 50 + 20}, ${Math.random() * 50 + 20}, ${Math.random() * 50 + 20}, 0.8)`;
        
        // Add windows
        const windowsX = Math.floor(width / 15);
        const windowsY = Math.floor(height / 20);
        
        for (let x = 0; x < windowsX; x++) {
          for (let y = 0; y < windowsY; y++) {
            if (Math.random() > 0.3) { // 70% chance of window
              const window = document.createElement('div');
              window.className = 'window';
              window.style.left = `${(x + 0.5) * (100 / windowsX)}%`;
              window.style.top = `${(y + 0.5) * (100 / windowsY)}%`;
              
              // Random window color (some lit, some dark)
              if (Math.random() > 0.6) {
                window.style.backgroundColor = '#FFE81F'; // Lit window
                window.style.boxShadow = '0 0 3px #FFE81F';
              } else if (Math.random() > 0.8) {
                window.style.backgroundColor = '#DC2626'; // Red window (The Boys theme)
                window.style.boxShadow = '0 0 3px #DC2626';
              }
              
              building.appendChild(window);
            }
          }
        }
        
        container.appendChild(building);
      }
    };

    createCityscape();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      color: 'white',
      fontFamily: "'Roboto', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #1a0a0a 0%, #0a0a1a 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div id="cityscape" className="cityscape" style={{ zIndex: 1 }}></div>
      <header style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 100%)',
        boxShadow: '0 4px 8px rgba(220, 38, 38, 0.3)',
        padding: '12px 0',
        width: '100%',
        borderBottom: '2px solid #DC2626',
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
          <Link to="/theboys" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: '#DC2626',
            textDecoration: 'none'
          }}>
            The Boys
          </Link>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link to="/theboys" style={{ 
              fontWeight: '500',
              color: '#DC2626',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              padding: '8px 12px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Home</Link>
            <Link to="/" style={{ 
              fontWeight: '500',
              color: '#DC2626',
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
      
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px',
        width: '100%',
        flex: '1',
        position: 'relative',
        zIndex: 5
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/show/:showTitle" element={<ShowPage />} />
          <Route path="*" element={<Navigate to="/theboys" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default TheBoys;
