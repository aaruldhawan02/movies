import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieByName, formatReleaseDate, getImagePath } from '../harrypotter-data';

function MoviePage() {
  const { movieTitle } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovie = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const decodedTitle = decodeURIComponent(movieTitle);
        const movieData = await getMovieByName(decodedTitle);
        
        if (!movieData) {
          setError('Movie not found');
        } else {
          setMovie(movieData);
        }
      } catch (error) {
        console.error('Error loading movie:', error);
        setError('Failed to load movie data');
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [movieTitle]);

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Function to render stars based on rating (Godzilla style)
  const renderStars = (rating) => {
    if (!rating || rating === 'N/A' || rating.trim() === '') return null;
    
    // Extract numeric rating (e.g., "4.5/5" -> 4.5)
    const numericRating = parseFloat(rating.split('/')[0]);
    
    // If parsing failed, return empty
    if (isNaN(numericRating)) return null;
    
    const maxStars = 5;
    const stars = [];
    
    for (let i = 1; i <= maxStars; i++) {
      if (i <= numericRating) {
        // Full star
        stars.push(
          <span key={i} style={{ color: '#ffd700', fontSize: '20px', marginRight: '3px' }}>★</span>
        );
      } else if (i - 0.5 <= numericRating) {
        // Half star (approximation)
        stars.push(
          <span key={i} style={{ color: '#ffd700', fontSize: '20px', marginRight: '3px', position: 'relative' }}>
            <span style={{ color: '#444' }}>★</span>
            <span style={{ 
              position: 'absolute', 
              left: 0, 
              top: 0,
              width: '50%',
              overflow: 'hidden',
              color: '#ffd700'
            }}>★</span>
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} style={{ color: '#444', fontSize: '20px', marginRight: '3px' }}>★</span>
        );
      }
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>{stars}</div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px'
      }}>
        <div className="golden-snitch"></div>
        <div style={{
          fontSize: '1.2rem',
          color: '#ffd700',
          textAlign: 'center',
          textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
        }}>
          Loading magical movie details...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px'
      }}>
        <div style={{
          fontSize: '1.2rem',
          color: '#ff6b6b',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
        <Link 
          to="/"
          className="magical-button"
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (!movie) return null;

  const imagePath = getImagePath(movie.Name);
  const videoId = getYouTubeVideoId(movie.Trailer);

  return (
    <div>
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <Link 
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ffd700',
            textDecoration: 'none',
            fontSize: '1rem',
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
            e.currentTarget.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
            e.currentTarget.style.textShadow = 'none';
          }}
        >
          ← Back to Wizarding World
        </Link>
      </div>

      {/* Movie Details */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '20px',
        overflow: 'hidden',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 215, 0, 0.2)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: '400px 1fr' },
          gap: '0'
        }}>
          {/* Movie Poster */}
          <div style={{
            position: 'relative',
            minHeight: '600px'
          }}>
            <img
              src={imagePath}
              alt={movie.Name}
              onError={handleImageError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                minHeight: '600px'
              }}
            />
            {/* Fallback for missing images */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #740001, #ae0001, #d3a625)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem'
            }}>
              ⚡
            </div>
          </div>

          {/* Movie Information */}
          <div style={{
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Title */}
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              background: 'linear-gradient(45deg, #ffd700, #c9b037)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.2',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
            }}>
              {movie.Name}
            </h1>

            {/* Release Date */}
            <div style={{
              fontSize: '1.1rem',
              color: '#ccc',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📅 Released: {formatReleaseDate(movie['Release Date'])}
            </div>

            {/* Ratings Grid */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              {movie['My Rating'] && movie['My Rating'] !== 'N/A' && movie['My Rating'].trim() !== '' && (
                <div>
                  {renderStars(movie['My Rating'])}
                </div>
              )}

              {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                <div style={{
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(68, 68, 68, 0.8)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    Critics {movie['Critic Rating']}
                  </div>
                </div>
              )}

              {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                <div style={{
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(45deg, #c9b037, #ffd700)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    Audience {movie['Audience Rating']}
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>

      {/* Trailer Embed (if available) */}
      {videoId && (
        <div style={{
          marginTop: '40px',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            marginBottom: '24px',
            color: '#ffd700',
            textAlign: 'center',
            textShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
          }}>
            🎬 Official Trailer
          </h2>
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            height: 0,
            overflow: 'hidden',
            borderRadius: '12px',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${movie.Name} Trailer`}
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
  );
}

export default MoviePage;
