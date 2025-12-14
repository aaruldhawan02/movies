import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';
import MainMovieCard from '../components/MainMovieCard';
import { loadAllMovies as loadMoviesData } from '../services/dataService';

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
      'Monsterverse': '#16a085',
      'Rocky': '#e74c3c',
      'Karate Kid': '#f39c12',
      'The Boys': '#000000',
      'Despicable Me': '#f1c40f',
      'Men in Black': '#2c3e50',
      'Chipmunks': '#e67e22',
      'YRF Spy Universe': '#8e44ad',
      'Back To The Future': '#ff9500',
      'Now You See Me': '#9b59b6',
      'Sonic': '#3498db',
      'Bollywood': '#e91e63',
      'Housefull': '#ff6b6b',
      'Stranger Things': '#c0392b'
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
    { name: 'DC', path: 'dc-movies', file: 'dcmovies.csv' }
  ];

  useEffect(() => {
    const loadAllMovies = async () => {
      try {
        // Load Marvel and DC from their separate files
        const franchisePromises = franchises.map(franchise => 
          fetch(`${process.env.PUBLIC_URL || '.'}/${franchise.path}/${franchise.file}`)
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

        // Load all other movies from Google Sheets or CSV
        const allMoviesPromise = loadMoviesData()
          .then(data => {
            const moviesWithFranchise = data
              .filter(movie => {
                const name = movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title;
                const rating = movie['My Tier'] || movie['My Rating'];
                const franchise = movie.Franchise || movie.franchise || 'Non-Franchise';
                return name && name.trim() && rating && rating.trim() && 
                       rating !== 'N/A' && rating !== 'Not Ranked' && rating !== '' && rating !== '-';
              })
              .map(movie => ({
                ...movie,
                Name: movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title,
                franchise: movie.Franchise || movie.franchise || 'Non-Franchise',
                franchisePath: ''
              }));
            return moviesWithFranchise;
          })
          .catch(error => {
            console.error('Error loading AllMovies:', error);
            return [];
          });

        const [franchiseMovies, allMovies] = await Promise.all([
          Promise.all(franchisePromises),
          allMoviesPromise
        ]);
        
        const combinedMovies = [...franchiseMovies.flat(), ...allMovies];
        const sortedMovies = sortMovies(combinedMovies, sortBy, sortOrder);
        
        setAllMovies(sortedMovies);
        setFilteredMovies(sortedMovies);
        setLoading(false);
      } catch (error) {
        console.error('Error loading movies:', error);
        setLoading(false);
      }
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
    
    if (movie.franchise === 'Marvel') {
      window.location.href = `/movies/${movie.franchisePath}/movie/${movieName}`;
    } else if (movie.franchise === 'DC') {
      window.location.href = `/movies/${movie.franchisePath}/movie/${movieName}`;
    } else {
      // Route all other movies to NonFranchiseMoviePage
      window.location.href = `/movies/non-franchise/movie/${movieName}`;
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
              {[...new Set(allMovies.map(movie => movie.franchise))].filter(franchise => franchise !== 'Non-Franchise' && franchise !== 'N/A').sort().map(franchise => (
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
        <div className="movies-page-grid">
          {filteredMovies.map((movie, index) => (
            <MainMovieCard 
              key={index} 
              movie={movie} 
              onClick={handleMovieClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Movies;
