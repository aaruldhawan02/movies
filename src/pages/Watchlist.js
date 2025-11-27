import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';

function Watchlist() {
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [franchiseFilter, setFranchiseFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const getFranchiseColor = (franchise) => {
    const colors = {
      'Marvel': '#d23b3b',
      'DC': '#0078d4',
      'Star Wars': '#FFE81F',
      'Fast & Furious': '#ff6b35',
      'Mission Impossible': '#2c3e50',
      'Pixar': '#00a8cc',
      'Harry Potter': '#740001',
      'Transformers': '#1e3a8a',
      'Monsterverse': '#16a085',
      'Rocky': '#e74c3c',
      'Karate Kid': '#f39c12',
      'The Boys': '#000000',
      'Despicable Me': '#f1c40f',
      'Men in Black': '#2c3e50',
      'Chipmunks': '#e67e22',
      'YRF Spy Universe': '#8e44ad',
      'Back to the Future': '#ff9500',
      'Now You See Me': '#9b59b6',
      'Sonic': '#3498db',
      'Bollywood': '#e91e63',
      'Housefull': '#ff6b6b',
      'Stranger Things': '#c0392b',
      'Back To The Future': '#ff9500',
      'Now You See Me': '#9b59b6',
      'Sonic': '#3498db',
      'Bollywood': '#e91e63'
    };
    return colors[franchise] || '#667eea';
  };

  const franchises = [];

  useEffect(() => {
    const loadWatchlistMovies = async () => {
      const currentDate = new Date();
      
      try {
        // Load only from AllMovies.csv (excluding Marvel, DC, Pixar)
        const allMoviesPromise = fetch(`${process.env.PUBLIC_URL || '.'}/AllMovies.csv`)
          .then(response => response.ok ? response.text() : '')
          .then(csvText => {
            if (!csvText) return [];
            return new Promise((resolve) => {
              Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                  const unwatchedMovies = results.data
                    .filter(movie => {
                      const name = movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title;
                      const rating = movie['My Tier'] || movie['My Rating'];
                      const franchise = movie.Franchise || movie.franchise || 'Non-Franchise';
                      const releaseDate = new Date(movie['Release Date']);
                      
                      return name && name.trim() && 
                             (rating === 'N/A' || rating === 'Not Watched' || !rating || rating.trim() === '') &&
                             franchise !== 'Marvel' && franchise !== 'DC' && franchise !== 'Pixar' &&
                             releaseDate <= currentDate; // Only include released movies
                    })
                    .map(movie => ({
                      ...movie,
                      Name: movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title,
                      franchise: movie.Franchise || movie.franchise || 'Non-Franchise',
                      franchisePath: ''
                    }));
                  resolve(unwatchedMovies);
                }
              });
            });
          })
          .catch(() => []);

        const allMovies = await allMoviesPromise;
        
        // Sort by release date (newest first)
        const sortedMovies = allMovies.sort((a, b) => {
          const dateA = new Date(a['Release Date']);
          const dateB = new Date(b['Release Date']);
          return dateB - dateA;
        });
        
        setWatchlistMovies(sortedMovies);
        setFilteredMovies(sortedMovies);
        setLoading(false);
      } catch (error) {
        console.error('Error loading watchlist:', error);
        setLoading(false);
      }
    };

    loadWatchlistMovies();
  }, []);

  useEffect(() => {
    const filtered = watchlistMovies.filter(movie =>
      (movie.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.franchise.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!franchiseFilter || movie.franchise === franchiseFilter)
    );
    setFilteredMovies(filtered);
  }, [searchTerm, watchlistMovies, franchiseFilter]);

  const handleMovieClick = (movie) => {
    const movieName = encodeURIComponent(movie.Name);
    
    if (movie.franchise === 'Marvel') {
      window.location.href = `/movies/${movie.franchisePath}/movie/${movieName}`;
    } else if (movie.franchise === 'DC') {
      window.location.href = `/movies/${movie.franchisePath}/movie/${movieName}`;
    } else {
      window.location.href = `/movies/non-franchise/movie/${movieName}`;
    }
  };

  if (loading) {
    return (
      <div className="App">
        <Navigation />
        <div className="loading-container">
          <h2>Loading watchlist...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ fontFamily: "'Arial', sans-serif" }}>
      <Navigation />
      <div className="hero-section">
        <h1 className="hero-title">Watchlist</h1>
        <p className="hero-subtitle">{filteredMovies.length} movies to watch</p>
        
        <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center', position: 'relative', zIndex: 10, width: '100%', maxWidth: '800px' }}>
          <input
            type="text"
            placeholder="Search movies or franchises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-custom"
            style={{ 
              width: '400px',
              padding: '12px 20px',
              borderRadius: '25px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.9)',
              fontSize: '16px',
              outline: 'none',
              color: '#333'
            }}
            onFocus={(e) => e.target.style.backgroundColor = 'white'}
            onBlur={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'}
          />
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '25px',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            position: 'relative',
            zIndex: 20,
            minWidth: '160px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Filter</span>
            <select 
              value={franchiseFilter} 
              onChange={(e) => setFranchiseFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(0,0,0,0.3)',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none',
                color: 'white',
                pointerEvents: 'auto'
              }}
            >
              <option value="" style={{ backgroundColor: '#333', color: 'white' }}>Select Franchise</option>
              {[...new Set(watchlistMovies.map(movie => movie.franchise))].filter(franchise => franchise !== 'Non-Franchise' && franchise !== 'N/A').sort().map(franchise => (
                <option key={franchise} value={franchise} style={{ backgroundColor: '#333', color: 'white' }}>
                  {franchise}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <main className="movies-container">
        <div className="movies-grid">
          {filteredMovies.map((movie, index) => (
            <div key={index} className="movie-card" onClick={() => handleMovieClick(movie)}>
              <div className="movie-poster">
                <img 
                  src={`${process.env.PUBLIC_URL || '.'}/posters/${
                    movie.franchise === 'Marvel'
                      ? movie.Name?.trim().replace(/[:.?!]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_') + '.png'
                      : movie.franchise === 'DC'
                      ? movie.Name?.trim().replace(/[:.?!()]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_') + '.png'
                      : movie.Name?.trim().replace(/[\/:.?!'()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_') + '.png'
                  }`}
                  alt={`${movie.Name} poster`}
                  loading="lazy"
                  style={{
                    backgroundColor: '#2a2a2a',
                    minHeight: '300px'
                  }}
                  onError={(e) => {e.target.style.display = 'none'}}
                />
                {movie.franchise !== 'Non-Franchise' && movie.franchise !== 'N/A' && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: getFranchiseColor(movie.franchise),
                    color: movie.franchise === 'Star Wars' ? '#000' : 'white',
                    padding: '6px 10px',
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    border: movie.franchise === 'Star Wars' ? '1px solid rgba(0,0,0,0.2)' : 'none',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {movie.franchise === 'Fast & Furious' ? 'F&F' : 
                     movie.franchise === 'Mission Impossible' ? 'MI' :
                     movie.franchise === 'YRF Spy Universe' ? 'YRF' :
                     movie.franchise === 'Men in Black' ? 'MIB' :
                     movie.franchise === 'Despicable Me' ? 'DM' :
                     movie.franchise === 'Back To The Future' ? 'BTTF' :
                     movie.franchise === 'Now You See Me' ? 'NYSM' :
                     movie.franchise === 'Monsterverse' ? 'MV' :
                     movie.franchise}
                  </span>
                )}
              </div>
              <div className="movie-info">
                <h3 className="movie-title">{movie.Name}</h3>
                <div className="movie-details">
                  <span className="movie-date">{movie['Release Date']}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Watchlist;
