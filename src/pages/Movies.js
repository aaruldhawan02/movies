import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';

function Movies() {
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('release');
  const [sortOrder, setSortOrder] = useState('desc');
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
      'Godzilla': '#16a085',
      'Rocky': '#e74c3c',
      'Karate Kid': '#f39c12',
      'The Boys': '#000000',
      'Despicable Me': '#f1c40f',
      'Men in Black': '#2c3e50',
      'Chipmunks': '#e67e22',
      'YRF Spy Universe': '#8e44ad'
    };
    return colors[franchise] || '#667eea';
  };

  const convertRatingToNumber = (rating) => {
    if (!rating) return 0;
    const tierMap = {
      'SS': 5, 'S': 4.5, 'AA': 4, 'A': 3.5, 'AB': 3, 'B': 2.5, 'C': 2, 'D': 1.5, 'F': 1
    };
    return tierMap[rating] || parseFloat(rating.split('/')[0]) || 0;
  };

  const sortMovies = (movies, sortType, order) => {
    return [...movies].sort((a, b) => {
      let result = 0;
      switch (sortType) {
        case 'alphabetical':
          result = a.Name.localeCompare(b.Name);
          break;
        case 'rating':
          const ratingA = convertRatingToNumber(a['My Tier'] || a['My Rating']);
          const ratingB = convertRatingToNumber(b['My Tier'] || b['My Rating']);
          result = ratingB - ratingA;
          break;
        case 'release':
        default:
          const dateA = new Date(a['Release Date']);
          const dateB = new Date(b['Release Date']);
          result = dateB - dateA;
          break;
      }
      return order === 'asc' ? -result : result;
    });
  };
 const franchises = [
    { name: 'Marvel', path: 'marvel-movies', file: 'movieInfo.csv' },
    { name: 'DC', path: 'dc-movies', file: 'dcmovies.csv' },
    { name: 'Fast & Furious', path: 'fast-saga', file: 'fast.csv' },
    { name: 'Mission Impossible', path: 'mission-impossible', file: 'missionimpossible.csv' },
    { name: 'Star Wars', path: 'star-wars', file: 'StarWars.csv' },
    { name: 'Pixar', path: 'pixar', file: 'pixar.csv' },
    { name: 'Harry Potter', path: 'harrypotter', file: 'harrypotter.csv' },
    { name: 'Transformers', path: 'transformers', file: 'transformers.csv' },
    { name: 'Godzilla', path: 'godzilla', file: 'godzilla.csv' },
    { name: 'Rocky', path: 'rocky', file: 'rocky.csv' },
    { name: 'Karate Kid', path: 'karate-kid', file: 'KarateKid.csv' },
    { name: 'The Boys', path: 'theboys', file: 'theBoys.csv' },
    { name: 'Despicable Me', path: 'despicable-me', file: 'despicableMe.csv' },
    { name: 'Men in Black', path: 'meninblack', file: 'meninblack.csv' },
    { name: 'Chipmunks', path: 'chipmunks', file: 'alvin.csv' },
    { name: 'YRF Spy Universe', path: 'yrf-spy-universe', file: 'yrfSpyUniverse.csv' },
    { name: 'Non-Franchise', path: '', file: 'NonFranchise.csv' }
  ];

  useEffect(() => {
    const loadAllMovies = async () => {
      const moviePromises = franchises.map(franchise => 
        fetch(`${process.env.PUBLIC_URL || '.'}/${franchise.path ? franchise.path + '/' : ''}${franchise.file}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
          })
          .then(csvText => {
            return new Promise((resolve) => {
              Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                  const moviesWithFranchise = results.data
                    .filter(movie => {
                      const name = movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title;
                      const rating = movie['My Tier'] || movie['My Rating'];
                      return name && name.trim() && rating && rating.trim() && 
                             rating !== 'N/A' && rating !== 'Not Ranked' && rating !== '' && rating !== '-';
                    })
                    .map(movie => ({
                      ...movie,
                      Name: movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title,
                      franchise: franchise.name,
                      franchisePath: franchise.path
                    }));
                  resolve(moviesWithFranchise);
                }
              });
            });
          })
          .catch(error => {
            console.error(`Error loading ${franchise.name}:`, error);
            return [];
          })
      );

      const movieArrays = await Promise.all(moviePromises);
      const combinedMovies = movieArrays.flat();
      
      const sortedMovies = sortMovies(combinedMovies, sortBy, sortOrder);
      
      setAllMovies(sortedMovies);
      setFilteredMovies(sortedMovies);
      setLoading(false);
    };

    loadAllMovies();
  }, []);

  useEffect(() => {
    const filtered = allMovies.filter(movie =>
      (movie.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.franchise.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!franchiseFilter || movie.franchise === franchiseFilter)
    );
    const sorted = sortMovies(filtered, sortBy, sortOrder);
    setFilteredMovies(sorted);
  }, [searchTerm, allMovies, sortBy, sortOrder, franchiseFilter]);

  const handleMovieClick = (movie) => {
    const movieName = encodeURIComponent(movie.Name);
    
    if (movie.franchise === 'Non-Franchise') {
      window.location.href = `/movies/non-franchise/movie/${movieName}`;
    } else if (movie.franchise === 'The Boys') {
      window.location.href = `/movies/${movie.franchisePath}/show/${movieName}`;
    } else {
      window.location.href = `/movies/${movie.franchisePath}/movie/${movieName}`;
    }
  };

  if (loading) {
    return (
      <div className="App">
        <Navigation />
        <div className="loading-container">
          <h2>Loading all movies...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ fontFamily: "'Arial', sans-serif" }}>
      <Navigation />
      <div className="hero-section">
        <h1 className="hero-title">All Movies</h1>
        <p className="hero-subtitle">{filteredMovies.length} rated movies across all franchises</p>
        <style>
          {`
            .search-input-custom::placeholder {
              color: #666 !important;
              opacity: 1 !important;
            }
          `}
        </style>
        <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center', position: 'relative', zIndex: 10, width: '100%', maxWidth: '1000px' }}>
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
              {[...new Set(allMovies.map(movie => movie.franchise))].filter(franchise => franchise !== 'Non-Franchise').sort().map(franchise => (
                <option key={franchise} value={franchise} style={{ backgroundColor: '#333', color: 'white' }}>
                  {franchise}
                </option>
              ))}
            </select>
          </div>

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
            minWidth: '220px',
            width: 'fit-content'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Sort</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
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
              <option value="release" style={{ backgroundColor: '#333', color: 'white' }}>Release Date</option>
              <option value="alphabetical" style={{ backgroundColor: '#333', color: 'white' }}>Alphabetical</option>
              <option value="rating" style={{ backgroundColor: '#333', color: 'white' }}>Rating</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              style={{
                padding: '6px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: sortOrder === 'desc' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                transition: 'all 0.2s ease',
                pointerEvents: 'auto'
              }}
              title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
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
                    movie.franchise === 'The Boys'
                      ? movie.Name?.trim().toLowerCase().replace(/[:.?!'()]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '-') + '.jpg'
                      : movie.franchise === 'Non-Franchise'
                      ? movie.Name?.trim().replace(/[\/:.?!()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_') + '.png'
                      : (
                        movie.franchise === 'Marvel' 
                          ? movie.Name?.trim().replace(/[:.?!]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')
                          : movie.franchise === 'Harry Potter'
                          ? movie.Name?.trim().replace(/[:.?!']/g, '').replace(/\.\.\./g, '').replace(/-/g, '_').replace(/\s+/g, '_')
                          : movie.franchise === 'Pixar'
                          ? movie.Name?.trim().replace(/[:.?!]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')
                          : movie.franchise === 'DC'
                          ? movie.Name?.trim().replace(/[:.?!()]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')
                          : movie.franchise === 'Star Wars'
                          ? movie.Name?.trim().replace(/[:.?!()]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')
                          : movie.Name?.trim().replace(/[:.?!'()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')
                      ) + '.png'
                  }`}
                  alt={`${movie.Name} poster`}
                  loading="lazy"
                  style={{
                    backgroundColor: '#2a2a2a',
                  }}
                  onError={(e) => {e.target.style.display = 'none'}}
                />
                {movie.franchise !== 'Non-Franchise' && (
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
                     movie.franchise}
                  </span>
                )}
                {(movie['My Tier'] || movie['My Rating']) && (
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '5px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    zIndex: 3,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}>
                    {movie['My Tier'] || movie['My Rating']}
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

export default Movies;
