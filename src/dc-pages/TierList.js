import React, { useEffect, useState } from 'react';
import { loadMovieInfo } from '../dc-data';
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
    // Replace spaces with underscores and remove special characters like : , ? ! ( )
    return title.replace(/ /g, '_').replace(/[:,.?!()]/g, '') + '.png';
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '20px', color: '#0078d4' }}>DC Movie Tier List</div>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.1)',
            borderTop: '5px solid #0078d4',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite',
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <p style={{ marginTop: '20px', opacity: 0.7, color: 'white' }}>Loading tier data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#0078d4' }}>Error Loading Data</h1>
        <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="dc-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="dc-hero">
        <h1 className="dc-hero-title dc-glow-text">DC Universe Tier List</h1>
        <p className="dc-hero-subtitle">
          DC projects ranked from best to worst
        </p>
      </div>
      
      {/* Stats Summary */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto 50px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '25px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h2 style={{
          fontSize: '24px',
          marginBottom: '25px',
          color: 'white',
          textAlign: 'center'
        }}>
          Distribution Summary
        </h2>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
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
                  <div key={tier} style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    padding: '10px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: color,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      color: '#000'
                    }}>
                      {tier}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{count}</div>
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
          borderRadius: '6px',
          overflow: 'hidden',
          marginTop: '20px'
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
                      transition: 'all 0.3s ease'
                    }}
                    title={`${tier}: ${count} projects (${percent.toFixed(1)}%)`}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scaleY(1.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scaleY(1)';
                    }}
                  >
                    {percent > 8 ? tier : ''}
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
              <div key={tier} style={{ marginBottom: '40px' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px',
                  gap: '15px'
                }}>
                  <div style={{
                    backgroundColor: color,
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '28px',
                    color: '#000',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}>
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
                    <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
                      {moviesByTier[tier].length} project{moviesByTier[tier].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '20px',
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
                      <div className="dc-card" style={{
                        height: '100%',
                        position: 'relative',
                        transform: 'rotate(0deg)',
                        borderColor: `${color}80`
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'rotate(-2deg) translateY(-8px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'rotate(0deg) translateY(0)';
                      }}>
                        {/* Movie poster image */}
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={`${process.env.PUBLIC_URL}/dc-movies/movieposters/${getImageFilename(movie.title)}`}
                            alt={`${movie.title} poster`}
                            onError={handleImageError}
                            style={{
                              width: '100%',
                              aspectRatio: '2/3',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          
                          {/* Fallback for missing images */}
                          <div 
                            style={{
                              width: '100%',
                              aspectRatio: '2/3',
                              backgroundColor: '#0a1f44',
                              color: '#0078d4',
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
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: color,
                            color: '#000',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
                                <div style={{
                                  backgroundColor: 'rgba(0, 120, 212, 0.9)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                  {movie.criticRating}
                                </div>
                              )}
                              
                              {movie.audienceRating && (
                                <div style={{
                                  backgroundColor: 'rgba(33, 33, 33, 0.9)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                  {movie.audienceRating}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Movie title caption */}
                        <div style={{
                          padding: '10px',
                          background: 'linear-gradient(to bottom, #0a1f44, #000000)',
                          color: 'white',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {movie.title}
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