import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { loadMovieData, formatReleaseDate, getImageFilename, getImagePath } from '../mission-impossible-data';

function MoviePage() {
  const { movieTitle } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const movieTitleFromState = location.state?.movieTitle;
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    const loadMovieDetails = async () => {
      setIsLoading(true);
      setPosterError(false);
      
      try {
        // Use the title from router params or from location state as fallback
        let titleToUse = movieTitle;
        
        // If router param is undefined/null, try to use the state
        if (!titleToUse && movieTitleFromState) {
          console.log('Using movie title from state:', movieTitleFromState);
          titleToUse = movieTitleFromState;
        }
        
        // If still no title, throw error
        if (!titleToUse) {
          console.error('No movie title found in URL or state');
          throw new Error('No movie title provided');
        }
        
        const decodedTitle = decodeURIComponent(titleToUse);
        console.log('Loading details for movie:', decodedTitle);
        
        // Load movie data
        const movies = await loadMovieData();
        
        // Find the movie by title
        const foundMovie = movies.find(m => m.Name === decodedTitle);
        
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          // If not found, check if it might be case-insensitive match
          const matchedMovie = movies.find(
            m => m.Name.toLowerCase() === decodedTitle.toLowerCase()
          );
          
          if (matchedMovie) {
            console.log('Found case-insensitive match:', matchedMovie.Name);
            setMovie(matchedMovie);
          } else {
            console.error(`Movie "${decodedTitle}" not found in database`);
            throw new Error(`Movie "${decodedTitle}" not found`);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading movie details:', err);
        setError(err.message || 'Failed to load movie details');
        setIsLoading(false);
      }
    };

    loadMovieDetails();
  }, [movieTitle, movieTitleFromState]);

  // Handle image load error
  const handlePosterError = () => {
    setPosterError(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>Mission Impossible Movie Details</div>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid #c00000',
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
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#c00000' }}>Error Loading Movie</h1>
        <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
        <Link to="/mission-impossible" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#c00000',
          color: 'white',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#a00000'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#c00000'}>
          Back to Home
        </Link>
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  const isUpcoming = new Date(movie.parsedReleaseDate) > new Date();

  return (
    <div>
      {/* Movie Hero Section */}
      <div style={{
        margin: '-24px -20px 30px -20px',
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(/mission-impossible/assets/mi-pattern-bg.jpg)',
        backgroundSize: 'cover',
        padding: '60px 20px 40px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            gap: '30px',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}>
            {/* Movie poster column */}
            <div style={{ 
              minWidth: '250px',
              maxWidth: '300px'
            }}>
              {!posterError ? (
                <div style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transform: 'rotate(-1deg)'
                }}>
                  <img 
                    src={getImagePath(getImageFilename(movie.Name))}
                    alt={`${movie.Name} poster`}
                    onError={handlePosterError}
                    style={{
                      width: '100%',
                      display: 'block'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '2/3',
                  backgroundColor: '#2a2a2a',
                  color: '#c00000',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '20px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                  transform: 'rotate(-1deg)'
                }}>
                  <div style={{ 
                    fontSize: '40px',
                    marginBottom: '15px'
                  }}>
                    {isUpcoming ? '🗓️' : '🎬'}
                  </div>
                  <div>{movie.Name}</div>
                </div>
              )}
            </div>
            
            {/* Movie details column */}
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                fontSize: '36px',
                fontWeight: 'bold',
                marginTop: 0, 
                marginBottom: '15px',
                color: 'white',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
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
                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 15px',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}>
                    <span style={{ opacity: 0.7 }}>Released:</span>
                    <span style={{ fontWeight: 'bold' }}>{formatReleaseDate(movie.parsedReleaseDate)}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div style={{
                    backgroundColor: isUpcoming ? '#7C3AED' : '#c00000',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    <span>{isUpcoming ? 'UPCOMING' : 'RELEASED'}</span>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '25px', 
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  {/* Critic Rating */}
                  <div style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.7 }}>Critic Rating</div>
                    <div style={{
                      backgroundColor: '#c00000',
                      color: 'white',
                      borderRadius: '50%',
                      width: '70px',
                      height: '70px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '22px',
                      boxShadow: '0 4px 10px rgba(192, 0, 0, 0.3)'
                    }}>
                      {movie['Critic Rating']}
                    </div>
                  </div>
                  
                  {/* Audience Rating */}
                  <div style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.7 }}>Audience Rating</div>
                    <div style={{
                      backgroundColor: '#333',
                      color: 'white',
                      borderRadius: '50%',
                      width: '70px',
                      height: '70px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '22px',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                    }}>
                      {movie['Audience Rating']}
                    </div>
                  </div>
                  
                  {/* My Rating */}
                  <div style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.7 }}>My Rating</div>
                    <div style={{
                      backgroundColor: '#FFD700',
                      color: 'black',
                      borderRadius: '50%',
                      width: '70px',
                      height: '70px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '22px',
                      boxShadow: '0 4px 10px rgba(255, 215, 0, 0.3)',
                      position: 'relative'
                    }}>
                      {/* Star rating display */}
                      <div style={{ 
                        position: 'absolute',
                        bottom: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '2px'
                      }}>
                        {(() => {
                          const rating = parseFloat(movie['My Rating']);
                          const stars = [];
                          const fullStars = Math.floor(rating);
                          const hasHalfStar = rating % 1 >= 0.5;
                          
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
                          
                          // Add empty stars to make 5 total
                          const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                          for (let i = 0; i < emptyStars; i++) {
                            stars.push(
                              <svg key={`empty-${i}`} style={{ width: '16px', height: '16px', fill: '#888888', opacity: 0.3 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            );
                          }
                          
                          return stars;
                        })()}
                      </div>
                      {movie['My Rating']}
                    </div>
                  </div>
                </div>
                
                {/* Movie Trailer Section */}
                {movie.Trailer && (
                  <div style={{
                    marginTop: '30px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      marginTop: 0,
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: '0.9'
                    }}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polygon points="5,3 19,12 5,21"></polygon>
                      </svg>
                      Official Trailer
                    </h3>
                    <div style={{
                      position: 'relative',
                      paddingBottom: '56.25%', // 16:9 aspect ratio
                      height: 0,
                      overflow: 'hidden',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }}>
                      <iframe
                        src={movie.Trailer.replace('watch?v=', 'embed/')}
                        title={`${movie.Name} Official Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to Home Button */}
      <div style={{ 
        maxWidth: '1100px', 
        margin: '40px auto 0',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Link to="/mission-impossible" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 24px',
          backgroundColor: '#c00000',
          color: 'white',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
          transition: 'background-color 0.2s ease',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#a00000'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#c00000'}>
          <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to All Movies
        </Link>
      </div>
    </div>
  );
}

export default MoviePage;
