import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';
import { loadAllMovies } from '../services/dataService';

function NonFranchiseMoviePage() {
  const { movieTitle } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    const loadMovieDetails = async () => {
      setIsLoading(true);
      setPosterError(false);
      
      try {
        const decodedTitle = decodeURIComponent(movieTitle);
        console.log('Loading details for movie:', decodedTitle);
        
        const data = await loadAllMovies();
        
        const movies = data.filter(movie => {
          const name = movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title;
          return name && name.trim();
        });
        
        const foundMovie = movies.find(m => {
          const movieName = m['Name '] || m.Name || m.name || m.Movie || m.Title;
          return movieName === decodedTitle;
        });
        
        if (foundMovie) {
          setMovie({
            ...foundMovie,
            Name: foundMovie['Name '] || foundMovie.Name || foundMovie.name || foundMovie.Movie || foundMovie.Title,
            Franchise: foundMovie.Franchise || foundMovie.franchise
          });
        } else {
          setError('Movie not found');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading movie:', err);
        setError('Failed to load movie details');
        setIsLoading(false);
      }
    };

    if (movieTitle) {
      loadMovieDetails();
    }
  }, [movieTitle]);

  const getPosterFilename = (title, franchise) => {
    if (franchise === 'Marvel') {
      return title?.trim().replace(/[:.?!]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_');
    } else if (franchise === 'DC') {
      return title?.trim().replace(/[:.?!()]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_');
    } else {
      return title?.trim().replace(/[\/:.?!'()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_');
    }
  };

  const getPosterSrc = () => {
    // Use Google Sheets URL if available
    if (movie['Poster Url'] && movie['Poster Url'].trim()) {
      return movie['Poster Url'];
    }
    
    // Fallback to existing logic
    return `${process.env.PUBLIC_URL || '.'}/posters/${getPosterFilename(movie.Name, movie.Franchise)}.png`;
  };

  const handlePosterError = () => {
    setPosterError(true);
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const numericRating = parseFloat(rating.split('/')[0]);
    const stars = [];
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} style={{ width: '16px', height: '16px', fill: '#FFD700' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half" style={{ width: '16px', height: '16px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="halfStarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#888888" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path fill="url(#halfStarGradient)" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    
    return <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>{stars}</span>;
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>Movie Details</div>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid rgba(255,255,255,0.3)',
              borderTop: '5px solid #667eea',
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
          <p style={{ marginTop: '20px', opacity: 0.7 }}>
            Loading details for {movieTitle ? decodeURIComponent(movieTitle) : 'movie'}...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navigation />
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#667eea' }}>Error Loading Movie</h1>
          <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
          <Link to="/movies" style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#764ba2'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}>
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <div>
      <Navigation />
      
      {/* Movie Hero Section */}
      <div style={{
        position: 'relative',
        background: '#1a1a1a',
        padding: '60px 20px 40px',
        color: 'white',
        minHeight: '400px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            gap: '40px',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}>
            {/* Movie poster column */}
            <div style={{ 
              minWidth: '280px',
              maxWidth: '320px',
              flex: '0 0 auto'
            }}>
              {!posterError ? (
                <div style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transform: 'rotate(-2deg)',
                  transition: 'transform 0.3s ease'
                }}>
                  <img 
                    src={getPosterSrc()}
                    alt={`${movie.Name} poster`}
                    onError={handlePosterError}
                    style={{
                      width: '100%',
                      display: 'block',
                      borderRadius: '16px'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '2/3',
                  backgroundColor: '#2a2a2a',
                  color: '#ccc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '30px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  transform: 'rotate(-2deg)',
                  border: '2px solid #333'
                }}>
                  <div style={{ 
                    fontSize: '48px',
                    marginBottom: '20px',
                    opacity: 0.7
                  }}>
                    🎬
                  </div>
                  <div style={{ fontSize: '16px', lineHeight: '1.4' }}>{movie.Name}</div>
                </div>
              )}
            </div>
            
            {/* Movie details column */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h1 style={{ 
                fontSize: '42px',
                fontWeight: '800',
                marginTop: 0, 
                marginBottom: '20px',
                color: 'white',
                lineHeight: '1.1'
              }}>
                {movie.Name}
              </h1>
              
              {/* Movie info */}
              <div style={{ 
                marginBottom: '30px'
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginBottom: '25px'
                }}>
                  {/* Release Date */}
                  {movie['Release Date'] && (
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: '10px 18px',
                      borderRadius: '25px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '15px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <span style={{ opacity: 0.7 }}>Released:</span>
                      <span style={{ fontWeight: 'bold' }}>{movie['Release Date']}</span>
                    </div>
                  )}
                  
                  {/* Watched Date */}
                  {(movie['Watch Date'] || movie['Watched Date'] || movie.WatchedDate) && 
                   (movie['Watch Date'] !== 'N/A' && movie['Watched Date'] !== 'N/A' && movie.WatchedDate !== 'N/A') && (
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: '10px 18px',
                      borderRadius: '25px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '15px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <span style={{ opacity: 0.7 }}>Watched:</span>
                      <span style={{ fontWeight: 'bold' }}>{movie['Watch Date'] || movie['Watched Date'] || movie.WatchedDate}</span>
                    </div>
                  )}
                  
                  {/* Franchise */}
                  {movie.Franchise && movie.Franchise !== 'N/A' && movie.Franchise !== 'Non-Franchise' && (
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: '10px 18px',
                      borderRadius: '25px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '15px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <span style={{ opacity: 0.7 }}>Franchise:</span>
                      <span style={{ fontWeight: 'bold' }}>{movie.Franchise}</span>
                    </div>
                  )}
                  
                  {/* My Rating */}
                  {movie['My Rating'] && movie['My Rating'] !== 'N/A' && movie['My Rating'] !== 'Not Watched' && (
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '10px 18px',
                      borderRadius: '25px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span>My Rating:</span>
                      <span>{renderStars(movie['My Rating'])}</span>
                    </div>
                  )}
                </div>
                
                {/* Ratings Row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginBottom: '25px'
                }}>
                  {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '10px 18px',
                      borderRadius: '25px',
                      fontSize: '15px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <span style={{ opacity: 0.7 }}>Critics: </span>
                      <span style={{ fontWeight: 'bold' }}>{movie['Critic Rating']}</span>
                    </div>
                  )}
                  
                  {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '10px 18px',
                      borderRadius: '25px',
                      fontSize: '15px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <span style={{ opacity: 0.7 }}>Audience: </span>
                      <span style={{ fontWeight: 'bold' }}>{movie['Audience Rating']}</span>
                    </div>
                  )}
                </div>
                
                {/* Trailer */}
                {movie.Trailer && (
                  <div style={{ marginTop: '25px' }}>
                    <div style={{
                      position: 'relative',
                      paddingBottom: '56.25%', // 16:9 aspect ratio
                      height: 0,
                      overflow: 'hidden',
                      borderRadius: '12px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    }}>
                      <iframe
                        src={movie.Trailer.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title={`${movie.Name} Trailer`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          borderRadius: '12px'
                        }}
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back Navigation */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 40px' }}>
        <Link 
          to="/movies"
          style={{
            display: 'inline-block',
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '10px 0'
          }}
        >
          ← Back to Movies
        </Link>
      </div>
    </div>
  );
}

export default NonFranchiseMoviePage;
