import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';

function Home() {
  const [recentMovies, setRecentMovies] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [ratingFranchiseFilter, setRatingFranchiseFilter] = useState('');
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      'Other': '#e67e22',
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

  const getRatingDistribution = () => {
    const distribution = {};
    const filteredMovies = ratingFranchiseFilter 
      ? allMovies.filter(movie => movie.franchise === ratingFranchiseFilter)
      : allMovies;
      
    // Get franchise counts to determine top 4 and overall order
    const franchiseCounts = {};
    filteredMovies.forEach(movie => {
      const franchise = movie.franchise || 'Other';
      if (franchise !== 'Non-Franchise' && franchise !== 'N/A') {
        franchiseCounts[franchise] = (franchiseCounts[franchise] || 0) + 1;
      }
    });
    
    const topFranchises = Object.entries(franchiseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([franchise]) => franchise);
    
    // Create overall franchise order (biggest to smallest)
    const franchiseOrder = Object.entries(franchiseCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([franchise]) => franchise);
      
    filteredMovies.forEach(movie => {
      const rating = movie['My Tier'] || movie['My Rating'];
      if (rating && rating !== 'N/A' && rating !== 'Not Ranked' && rating !== '' && rating !== '-') {
        let ratingKey;
        // Use tier rankings only when Marvel or DC is selected as franchise filter
        if ((ratingFranchiseFilter === 'Marvel' || ratingFranchiseFilter === 'DC') && (movie['My Tier'] || movie['My Rating'])) {
          ratingKey = rating; // Use tier directly (SS, S, AA, etc.)
        } else {
          ratingKey = convertRatingToNumber(rating); // Convert to numeric
        }
        
        if (!distribution[ratingKey]) {
          distribution[ratingKey] = {};
        }
        let franchise = movie.franchise || 'Other';
        if (franchise === 'Non-Franchise' || franchise === 'N/A') {
          franchise = 'Other';
        }
        // Group smaller franchises as "Other" when showing all franchises
        if (!ratingFranchiseFilter && !topFranchises.includes(franchise)) {
          franchise = 'Other';
        }
        distribution[ratingKey][franchise] = (distribution[ratingKey][franchise] || 0) + 1;
      }
    });
    
    // Store franchise order for use in rendering
    distribution._franchiseOrder = franchiseOrder;
    
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
    { name: 'DC', path: 'dc-movies', file: 'dcmovies.csv' }
  ];

  useEffect(() => {
    const loadRecentMovies = async () => {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      try {
        // Load Marvel and DC from their separate files
        const franchisePromises = franchises.map(franchise => 
          fetch(`${process.env.PUBLIC_URL || '.'}/${franchise.path}/${franchise.file}`)
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

        // Load all other movies from AllMovies.csv
        const allMoviesPromise = fetch(`${process.env.PUBLIC_URL || '.'}/AllMovies.csv`)
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
                      franchise: movie.Franchise || movie.franchise || 'Non-Franchise',
                      franchisePath: ''
                    }));
                  resolve(moviesWithFranchise);
                }
              });
            });
          })
          .catch(() => []);

        const [franchiseMovies, allMovies] = await Promise.all([
          Promise.all(franchisePromises),
          allMoviesPromise
        ]);
        
        const combinedMovies = [...franchiseMovies.flat(), ...allMovies];
        
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
      } catch (error) {
        console.error('Error loading movies:', error);
      }
    };

    const loadRecentlyWatched = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL || '.'}/AllMovies.csv`);
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
                       watchedDate && watchedDate.trim() && watchedDate !== 'N/A';
              })
              .map(movie => ({
                ...movie,
                Name: movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title,
                franchise: movie.Franchise || movie.franchise || 'Non-Franchise',
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
            maxWidth: isMobile ? 'calc(100vw - 40px)' : '700px', 
            margin: isMobile ? '40px auto' : '80px auto', 
            padding: isMobile ? '25px 15px 20px' : '40px 30px 30px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
            borderRadius: '24px',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '50px'
            }}>
              <h3 style={{ 
                color: 'white', 
                fontSize: isMobile ? '20px' : '26px',
                fontWeight: '700',
                margin: '0',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                letterSpacing: '0.5px'
              }}>
                My Rating Distribution
              </h3>
              
              <select 
                value={ratingFranchiseFilter} 
                onChange={(e) => setRatingFranchiseFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  outline: 'none',
                  color: 'white',
                  minWidth: '120px'
                }}
              >
                <option value="" style={{ backgroundColor: '#333', color: 'white' }}>All Franchises</option>
                {[...new Set(allMovies.map(movie => movie.franchise))].filter(franchise => franchise !== 'Non-Franchise' && franchise !== 'N/A').sort().map(franchise => (
                  <option key={franchise} value={franchise} style={{ backgroundColor: '#333', color: 'white' }}>
                    {franchise}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tooltip below dropdown */}
            <div style={{
              textAlign: 'right',
              marginBottom: '20px',
              height: '20px'
            }}>
              <div style={{
                display: 'inline-block',
                backgroundColor: 'rgba(0,0,0,0.9)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                opacity: tooltip.show ? 1 : 0,
                transition: 'opacity 0.2s ease'
              }}>
                {tooltip.text || 'Hover over chart segments'}
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              justifyContent: 'center',
              gap: isMobile ? '4px' : '14px',
              height: isMobile ? '100px' : '160px',
              padding: isMobile ? '0 5px' : '0 20px'
            }}>
              {getRatingDistribution().map(([rating, franchiseData]) => {
                if (rating === '_franchiseOrder') return null;
                const totalCount = Object.values(franchiseData).reduce((sum, count) => sum + count, 0);
                const maxCount = Math.max(...getRatingDistribution().map(([r, data]) => 
                  r === '_franchiseOrder' ? 0 : Object.values(data).reduce((sum, count) => sum + count, 0)
                ));
                const height = Math.max((totalCount / maxCount) * (isMobile ? 60 : 110), 10);
                const filteredMovies = ratingFranchiseFilter 
                  ? allMovies.filter(movie => movie.franchise === ratingFranchiseFilter)
                  : allMovies;
                const percentage = ((totalCount / filteredMovies.length) * 100).toFixed(1);
                
                // Get overall franchise order
                const distributionData = getRatingDistribution();
                const franchiseOrderEntry = distributionData.find(([r]) => r === '_franchiseOrder');
                const franchiseOrder = franchiseOrderEntry ? franchiseOrderEntry[1] : [];
                
                return (
                  <div key={rating} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    width: isMobile ? '25px' : '58px',
                    position: 'relative'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '10px' : '14px',
                      color: 'white',
                      marginBottom: isMobile ? '3px' : '6px',
                      fontWeight: '700',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                    }}>
                      {totalCount}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '8px' : '11px',
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: isMobile ? '5px' : '10px',
                      fontWeight: '500'
                    }}>
                      {percentage}%
                    </div>
                    <div style={{
                      width: isMobile ? '20px' : '42px',
                      height: `${height}px`,
                      borderRadius: '8px 8px 4px 4px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(0,0,0,0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column-reverse'
                    }}>
                      {Object.entries(franchiseData)
                        .sort(([a], [b]) => {
                          const aIndex = franchiseOrder.indexOf(a);
                          const bIndex = franchiseOrder.indexOf(b);
                          return aIndex - bIndex; // Biggest first, but column-reverse will put them at bottom
                        })
                        .map(([franchise, count], index) => {
                        const segmentHeight = (count / totalCount) * height;
                        return (
                          <div
                            key={franchise}
                            style={{
                              height: `${segmentHeight}px`,
                              backgroundColor: getFranchiseColor(franchise),
                              position: 'relative',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={() => {
                              setTooltip({
                                show: true,
                                text: `${franchise}: ${count} movies`,
                                x: 0,
                                y: 0
                              });
                            }}
                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                          />
                        );
                      })}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '10px' : '15px',
                      color: 'white',
                      marginTop: isMobile ? '6px' : '12px',
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
                      src={`${process.env.PUBLIC_URL || '.'}/posters/${movie.Name?.trim().replace(/[\/:.?!'()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')}.png`}
                      alt={`${movie.Name} poster`}
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
                        movie.franchise === 'Marvel' 
                          ? movie.Name?.trim().replace(/[:.?!]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')
                          : movie.franchise === 'DC'
                          ? movie.Name?.trim().replace(/[:.?!()]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')
                          : movie.Name?.trim().replace(/[\/:.?!'()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')
                      }.png`}
                      alt={`${movie.Name} poster`}
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
