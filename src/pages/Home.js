import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';

function Home() {
  const [recentMovies, setRecentMovies] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);

  const featuredCollections = [
    {
      title: 'Marvel Movies',
      description: 'Explore the Marvel Cinematic Universe and beyond',
      path: '/marvel-movies',
      color: '#d23b3b',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/marvel-logo.svg`,
      count: '100+ projects'
    },
    {
      title: 'DC Movies',
      description: 'Explore the DC Universe and beyond',
      path: '/dc-movies',
      color: '#0078d4',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/dc-logo.png`,
      count: '50+ projects'
    }
  ];

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
    const loadRecentMovies = async () => {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const moviePromises = franchises.map(franchise => 
        fetch(`${process.env.PUBLIC_URL || '.'}/${franchise.path ? franchise.path + '/' : ''}${franchise.file}`)
          .then(response => response.ok ? response.text() : '')
          .then(csvText => {
            if (!csvText) return [];
            return new Promise((resolve) => {
              Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                  const moviesWithFranchise = results.data
                    .filter(movie => {
                      const name = movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title;
                      const rating = movie['My Tier'] || movie['My Rating'];
                      const releaseDate = new Date(movie['Release Date']);
                      return name && name.trim() && rating && rating.trim() && 
                             rating !== 'N/A' && rating !== 'Not Ranked' && rating !== '' && rating !== '-' &&
                             releaseDate >= twelveMonthsAgo;
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
          .catch(() => [])
      );

      const movieArrays = await Promise.all(moviePromises);
      const combinedMovies = movieArrays.flat();
      
      const sortedMovies = combinedMovies.sort((a, b) => {
        const dateA = new Date(a['Release Date']);
        const dateB = new Date(b['Release Date']);
        return dateB - dateA;
      });
      
      setRecentMovies(sortedMovies.slice(0, 21));
    };

    const loadRecentlyWatched = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL || '.'}/NonFranchise.csv`);
        if (!response.ok) return;
        
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const watchedMovies = results.data
              .filter(movie => {
                const name = movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title;
                const rating = movie['My Tier'] || movie['My Rating'];
                const watchedDate = movie['Watched Date'] || movie['Watch Date'] || movie.WatchedDate;
                return name && name.trim() && rating && rating.trim() && 
                       rating !== 'N/A' && rating !== 'Not Ranked' && rating !== '' && rating !== '-' &&
                       watchedDate && watchedDate.trim();
              })
              .map(movie => ({
                ...movie,
                Name: movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title,
                franchise: 'Non-Franchise',
                franchisePath: ''
              }))
              .sort((a, b) => {
                const dateA = new Date(a['Watched Date'] || a['Watch Date'] || a.WatchedDate);
                const dateB = new Date(b['Watched Date'] || b['Watch Date'] || b.WatchedDate);
                return dateB - dateA;
              });
            
            setRecentlyWatched(watchedMovies.slice(0, 12));
          }
        });
      } catch (error) {
        console.error('Error loading recently watched:', error);
      }
    };

    loadRecentMovies();
    loadRecentlyWatched();
  }, []);

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

  return (
    <div className="App" style={{ fontFamily: "'Arial', sans-serif" }}>
      <Navigation />
      <div className="hero-section">
        <h1 className="hero-title">Featured Collections</h1>
        <p className="hero-subtitle">Explore popular movie franchises and collections</p>
      </div>
      
      <main className="collections-container">
        <div className="collections-grid">
          {featuredCollections.map((collection, index) => (
            <Link 
              key={index} 
              to={collection.path}
              className="collection-card"
              style={{ 
                '--accent-color': collection.color,
                '--accent-color-rgb': collection.color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', '),
                textDecoration: 'none', 
                color: 'inherit' 
              }}
            >
              <div className="card-content">
                <div className="card-icon">
                  <img 
                    src={collection.logo} 
                    alt={`${collection.title} logo`}
                    className="card-logo"
                  />
                </div>
                <h2 className="card-title">{collection.title}</h2>
                <p className="card-description">{collection.description}</p>
                <div className="card-count">{collection.count}</div>
              </div>
              
              <div className="card-overlay"></div>
            </Link>
          ))}
        </div>

        {recentlyWatched.length > 0 && (
          <div className="recent-movies-section">
            <h2 className="section-title">Recently Watched</h2>
            <div className="movies-grid">
              {recentlyWatched.map((movie, index) => (
                <div key={index} className="movie-card" onClick={() => handleMovieClick(movie)}>
                  <div className="movie-poster">
                    <img 
                      src={`${process.env.PUBLIC_URL || '.'}/posters/${movie.Name?.trim().replace(/[\/:.?!()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')}.png`}
                      alt={`${movie.Name} poster`}
                      onError={(e) => {e.target.style.display = 'none'}}
                    />
                    {(movie['My Tier'] || movie['My Rating']) && (
                      <span className="movie-rating">
                        {movie['My Tier'] || movie['My Rating']}
                      </span>
                    )}
                  </div>
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.Name}</h3>
                    <div className="movie-details">
                      <span className="movie-date">Watched Date: {movie['Watched Date'] || movie['Watch Date'] || movie.WatchedDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentMovies.length > 0 && (
          <div className="recent-movies-section">
            <h2 className="section-title">Recently Released</h2>
            <div className="movies-grid">
              {recentMovies.map((movie, index) => (
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
                      onError={(e) => {e.target.style.display = 'none'}}
                    />
                    {(movie['My Tier'] || movie['My Rating']) && (
                      <span className="movie-rating">
                        {movie['My Tier'] || movie['My Rating']}
                      </span>
                    )}
                  </div>
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.Name}</h3>
                    <div className="movie-details">
                      <span className="movie-date">Release Date: {movie['Release Date']}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p>&copy; 2025 Movie Collections Hub. Built with React.</p>
      </footer>
    </div>
  );
}

export default Home;
