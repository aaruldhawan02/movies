import React, { useEffect, useState } from 'react';
import { loadMovieInfo } from './marvel-data';
import { Link } from 'react-router-dom';

// Define tier colors and order
const TIERS = {
  'Currently Watching': { color: '#FFD700', order: 0, description: 'Currently Watching' },
  'SS': { color: '#FF44A4', order: 1, description: 'Masterpiece' },
  'S': { color: '#FF7F7F', order: 2, description: 'Excellent' },
  'AA': { color: '#FFBF7F', order: 3, description: 'Outstanding' },
  'A': { color: '#FFDF7F', order: 4, description: 'Great' },
  'AB': { color: '#FFFF7F', order: 5, description: 'Very Good' },
  'B': { color: '#BFFF7F', order: 6, description: 'Good' },
  'C': { color: '#7FFF7F', order: 7, description: 'Average' },
  'D': { color: '#7FFFFF', order: 8, description: 'Below Average' },
  'F': { color: '#7F7FFF', order: 9, description: 'Poor' },
  'Not Ranked': { color: '#6D6D6D', order: 10, description: 'Not Ranked' }
};

function TierList() {
  const [moviesByTier, setMoviesByTier] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tierStats, setTierStats] = useState({});

  useEffect(() => {
    const loadTierListData = async () => {
      setIsLoading(true);
      
      try {
        // Load movie info for tier data
        const movieInfoMap = await loadMovieInfo();
        console.log('Loaded movie info for tier list:', Object.keys(movieInfoMap).length, 'projects');
        
        // Group movies by tier
        const tierGroups = {};
        const stats = {};
        
        // Initialize tier groups
        Object.keys(TIERS).forEach(tier => {
          tierGroups[tier] = [];
          stats[tier] = 0;
        });
        
        // Get current date for upcoming movie filtering
        const currentDate = new Date();
        
        // Sort movies into tiers
        Object.entries(movieInfoMap).forEach(([title, info]) => {
          // Skip normalized entries (they start with __normalized__)
          if (title.startsWith('__normalized__')) {
            return;
          }
          
          // Skip upcoming movies from tier list
          if (info.releaseDate) {
            const releaseDate = parseReleaseDate(info.releaseDate);
            if (releaseDate > currentDate) {
              console.log('Skipping upcoming movie from tier list:', title);
              return; // Skip upcoming movies
            }
          }
          
          // Get the tier, defaulting to "Not Ranked" if not present
          const tier = info.myTier || 'Not Ranked';
          
          // Ensure the tier exists (in case of unexpected tiers)
          if (!tierGroups[tier]) {
            console.warn(`Unknown tier "${tier}" for movie "${title}"`);
            tierGroups['Not Ranked'].push({
              title,
              releaseDate: info.releaseDate || '',
              criticRating: info.criticRating || '',
              audienceRating: info.audienceRating || '',
              phase: info.phase || ''
            });
            stats['Not Ranked']++;
          } else {
            // Add movie to its tier group
            tierGroups[tier].push({
              title,
              releaseDate: info.releaseDate || '',
              criticRating: info.criticRating || '',
              audienceRating: info.audienceRating || '',
              phase: info.phase || ''
            });
            stats[tier]++;
          }
        });
        
        console.log('Grouped movies by tier:', Object.keys(tierGroups).map(tier => `${tier}: ${tierGroups[tier].length}`));
        
        // Sort movies within each tier by release date (newest first)
        Object.keys(tierGroups).forEach(tier => {
          tierGroups[tier].sort((a, b) => {
            const dateA = parseReleaseDate(a.releaseDate);
            const dateB = parseReleaseDate(b.releaseDate);
            return dateB - dateA; // Newest first
          });
        });
        
        setMoviesByTier(tierGroups);
        setTierStats(stats);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading tier list data:', err);
        setError('Failed to load tier list data');
        setIsLoading(false);
      }
    };
    
    loadTierListData();
  }, []);

  // Parse release date from string
  const parseReleaseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    
    // Handle partial dates like "3/4" (missing year)
    if (dateStr.split('/').length === 2) {
      return new Date(0); // Default to epoch for incomplete dates
    }
    
    // Try to parse the date in MM/DD/YY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      
      // Handle 2-digit years
      if (year < 100) {
        year = year < 50 ? 2000 + year : 1900 + year;
      }
      
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Default date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return new Date(0);
  };

  // Convert movie title to image filename
  const getImageFilename = (title) => {
    // Replace spaces with underscores and remove special characters like : and ,
    return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="marvel-loader-container">
        <div className="marvel-shield-loader"></div>
        <div className="marvel-loader-text">Loading Tier List...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 className="comic-title">Error Loading Data</h1>
        <div className="speech-bubble">
          <p>{error}</p>
        </div>
        <button 
          className="comic-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="marvel-hero">
        <div className="marvel-hero-title-container">
          <h1 className="marvel-hero-title">Marvel Universe Tier List</h1>
        </div>
        <p className="marvel-hero-subtitle">
          Marvel projects ranked from best to worst
        </p>
        <div className="comic-divider"></div>
      </div>
      
      {/* Stats Summary */}
      <div className="marvel-card" style={{
        maxWidth: '1000px',
        margin: '0 auto 50px',
        padding: '25px',
      }}>
        <h2 className="marvel-section-header">
          Distribution Summary
        </h2>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {(() => {
            // Calculate total ranked movies (excluding Not Ranked and Currently Watching)
            const rankedTiers = Object.entries(TIERS)
              .filter(([tier]) => tier !== 'Not Ranked' && tier !== 'Currently Watching');
            const totalRankedMovies = rankedTiers.reduce((sum, [tier]) => sum + (tierStats[tier] || 0), 0);
            
            return rankedTiers
              .sort((a, b) => a[1].order - b[1].order)
              .map(([tier, { color, description }]) => {
                const count = tierStats[tier] || 0;
                if (count === 0) return null;
                
                const percent = totalRankedMovies > 0 ? ((count / totalRankedMovies) * 100).toFixed(1) : '0.0';
                
                return (
                  <div key={tier} className="page-turn" style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    padding: '10px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '4px',
                      backgroundColor: color,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: '#000',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {tier}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{count}</div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>{percent}%</div>
                    </div>
                  </div>
                );
              });
          })()}
        </div>
        
        {/* Visual bar chart */}
        <div style={{
          display: 'flex',
          height: '40px',
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          marginTop: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          {(() => {
            // Calculate total ranked movies (excluding Not Ranked and Currently Watching)
            const rankedTiers = Object.entries(TIERS)
              .filter(([tier]) => tier !== 'Not Ranked' && tier !== 'Currently Watching');
            const totalRankedMovies = rankedTiers.reduce((sum, [tier]) => sum + (tierStats[tier] || 0), 0);
            
            return rankedTiers
              .sort((a, b) => a[1].order - b[1].order)
              .map(([tier, { color }]) => {
                const count = tierStats[tier] || 0;
                if (count === 0) return null;
                
                const percent = totalRankedMovies > 0 ? (count / totalRankedMovies) * 100 : 0;
                
                return (
                  <div 
                    key={tier} 
                    style={{
                      width: `${percent}%`,
                      backgroundColor: color,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      color: '#000',
                      textShadow: '0 0 2px rgba(255,255,255,0.5)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    title={`${tier}: ${count} projects (${percent.toFixed(1)}%)`}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scaleY(1.2)';
                      e.currentTarget.style.zIndex = '1';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scaleY(1)';
                      e.currentTarget.style.zIndex = '0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {percent > 8 ? tier : ''}
                    {percent > 8 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)',
                        pointerEvents: 'none'
                      }}></div>
                    )}
                  </div>
                );
              });
          })()}
        </div>
      </div>
      
      {/* Tier list */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 50px' }}>
        {Object.entries(TIERS)
          .sort((a, b) => a[1].order - b[1].order) // Sort tiers by defined order
          .map(([tier, { color, description }]) => {
            // Skip empty tiers
            if (!moviesByTier[tier] || moviesByTier[tier].length === 0) {
              return null;
            }
            
            return (
              <div key={tier} className="phase-section">
                <div className="phase-header">
                  <div className="phase-title" style={{ backgroundColor: color }}>
                    {tier === 'Not Ranked' ? '?' : tier === 'Currently Watching' ? '▶' : tier}
                  </div>
                  <div>
                    <h2 style={{ 
                      margin: '0 0 5px 0', 
                      color: 'white',  
                      fontSize: '24px'
                    }}>
                      {tier === 'Not Ranked' ? 'Not Ranked' : tier === 'Currently Watching' ? 'Currently Watching' : `${tier} Tier: ${description}`}
                    </h2>
                    <span className="phase-count">
                      {moviesByTier[tier].length} project{moviesByTier[tier].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="movie-grid" style={{ 
                  background: `linear-gradient(to right, ${color}10, ${color}20)`,
                  padding: '25px',
                  borderRadius: '12px',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)'
                }}>
                  {moviesByTier[tier].map((movie) => (
                    <Link 
                      key={movie.title}
                      to={`../movie/${encodeURIComponent(movie.title)}`}
                      state={{ movieTitle: movie.title }}
                      style={{ 
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block'
                      }}
                    >
                      <div className="movie-card">
                        {/* Movie poster image */}
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movie.title)}`}
                            alt={`${movie.title} poster`}
                            onError={handleImageError}
                            className="movie-card-image"
                          />
                          
                          {/* Fallback for missing images */}
                          <div 
                            style={{
                              width: '100%',
                              aspectRatio: '2/3',
                              backgroundColor: '#2a2a2a',
                              color: 'var(--marvel-red)',
                              display: 'none', // Initially hidden, shown on image error
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: '10px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '14px'
                            }}
                          >
                            <div style={{ 
                              fontSize: '24px',
                              marginBottom: '8px'
                            }}>
                              🎬
                            </div>
                            {movie.title}
                          </div>
                          
                          {/* Tier badge */}
                          <div className="marvel-phase-badge" style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: color,
                            color: '#000',
                          }}>
                            {tier === 'Not Ranked' ? '?' : tier === 'Currently Watching' ? '▶' : tier}
                          </div>
                          
                          {/* Ratings badges if available */}
                          {(movie.criticRating || movie.audienceRating) && (
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              left: '8px',
                              display: 'flex',
                              gap: '6px'
                            }}>
                              {movie.criticRating && (
                                <div className="marvel-rating-badge marvel-rating-critic">
                                  {movie.criticRating}
                                </div>
                              )}
                              
                              {movie.audienceRating && (
                                <div className="marvel-rating-badge marvel-rating-audience">
                                  {movie.audienceRating}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Movie title caption */}
                        <div className="movie-card-content">
                          <div className="movie-card-title">{movie.title}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default TierList;