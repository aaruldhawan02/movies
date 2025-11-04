import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';

function Movies() {
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
    { name: 'Karate Kid', path: 'karate-kid', file: 'karateKid.csv' },
    { name: 'The Boys', path: 'theboys', file: 'theboys.csv' },
    { name: 'Despicable Me', path: 'despicable-me', file: 'despicableMe.csv' },
    { name: 'Men in Black', path: 'meninblack', file: 'meninblack.csv' },
    { name: 'Chipmunks', path: 'chipmunks', file: 'chipmunks.csv' },
    { name: 'YRF Spy Universe', path: 'yrf-spy-universe', file: 'yrfSpyUniverse.csv' }
  ];

  useEffect(() => {
    const loadAllMovies = async () => {
      const moviePromises = franchises.map(franchise => 
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

      const movieArrays = await Promise.all(moviePromises);
      const combinedMovies = movieArrays.flat();
      
      // Sort by release date
      const sortedMovies = combinedMovies.sort((a, b) => {
        const dateA = new Date(a['Release Date']);
        const dateB = new Date(b['Release Date']);
        return dateB - dateA; // Most recent first
      });
      
      setAllMovies(sortedMovies);
      setFilteredMovies(sortedMovies);
      setLoading(false);
    };

    loadAllMovies();
  }, []);

  useEffect(() => {
    const filtered = allMovies.filter(movie =>
      movie.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.franchise.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [searchTerm, allMovies]);

  const handleMovieClick = (movie) => {
    const movieName = encodeURIComponent(movie.Name);
    if (movie.franchise === 'The Boys') {
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
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies or franchises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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
                  onError={(e) => {e.target.style.display = 'none'}}
                />
              </div>
              <div className="movie-info">
                <h3 className="movie-title">{movie.Name}</h3>
                <div className="movie-details">
                  <span className="movie-date">{movie['Release Date']}</span>
                  {(movie['My Tier'] || movie['My Rating']) && (
                    <span className="movie-rating">
                      {movie['My Tier'] || movie['My Rating']}
                    </span>
                  )}
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
