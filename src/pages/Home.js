import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';

function Home() {
  const [recentMovies, setRecentMovies] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [allMovies, setAllMovies] = useState([]);

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

  const getRatingDistribution = () => {
    const distribution = {};
    allMovies.forEach(movie => {
      const rating = movie['My Tier'] || movie['My Rating'];
      if (rating && rating !== 'N/A' && rating !== 'Not Ranked' && rating !== '' && rating !== '-') {
        const numericRating = convertRatingToNumber(rating);
        distribution[numericRating] = (distribution[numericRating] || 0) + 1;
      }
    });
    
    return Object.entries(distribution).sort(([a], [b]) => {
      return parseFloat(b) - parseFloat(a);
    });
  };

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
          .catch(() => [])
      );

      const movieArrays = await Promise.all(moviePromises);
      const combinedMovies = movieArrays.flat();
      
      setAllMovies(combinedMovies);
      
      // Filter for recent movies
      const recentMoviesFiltered = combinedMovies.filter(movie => {
        const releaseDate = new Date(movie['Release Date']);
        return releaseDate >= twelveMonthsAgo;
      });
      
      const sortedMovies = recentMoviesFiltered.sort((a, b) => {
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

        {/* Rating Distribution Chart */}
        {allMovies.length > 0 && (
          <div style={{ 
            maxWidth: '700px', 
            margin: '80px auto', 
            padding: '40px 30px 30px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
            borderRadius: '24px',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ 
              textAlign: 'center', 
              color: 'white', 
              marginBottom: '50px',
              fontSize: '26px',
              fontWeight: '700',
              margin: '0 0 50px 0',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              letterSpacing: '0.5px'
            }}>
              My Rating Distribution
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              justifyContent: 'center',
              gap: '14px',
              height: '160px',
              padding: '0 20px'
            }}>
              {getRatingDistribution().map(([rating, count]) => {
                const maxCount = Math.max(...getRatingDistribution().map(([, c]) => c));
                const height = Math.max((count / maxCount) * 110, 15);
                const percentage = ((count / allMovies.length) * 100).toFixed(1);
                return (
                  <div key={rating} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    width: '58px',
                    position: 'relative'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: 'white',
                      marginBottom: '6px',
                      fontWeight: '700',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                    }}>
                      {count}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '10px',
                      fontWeight: '500'
                    }}>
                      {percentage}%
                    </div>
                    <div style={{
                      width: '42px',
                      height: `${height}px`,
                      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px 8px 4px 4px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(0,0,0,0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-4px) scale(1.08)';
                      e.target.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.6), 0 4px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(0,0,0,0.2)';
                    }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '35%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)',
                        borderRadius: '8px 8px 0 0'
                      }} />
                    </div>
                    <div style={{
                      fontSize: '15px',
                      color: 'white',
                      marginTop: '12px',
                      fontWeight: '700',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                    }}>
                      {rating}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
