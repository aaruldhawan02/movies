import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadMovieData, formatReleaseDate, getImagePath, getImageFilename } from '../godzilla-data';

const MoviePage = () => {
  const { movieTitle } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const movies = await loadMovieData();
        const decodedTitle = decodeURIComponent(movieTitle);
        const foundMovie = movies.find(m => m.Name === decodedTitle);
        
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie data');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieTitle]);

  // Function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return null;
  };

  // Function to render star rating
  const renderStarRating = (rating) => {
    if (!rating || rating === 'N/A') return null;
    
    // Extract numeric rating (e.g., "4.5/5" -> 4.5)
    const numericRating = parseFloat(rating.split('/')[0]);
    const maxStars = 5;
    const stars = [];
    
    for (let i = 1; i <= maxStars; i++) {
      if (i <= numericRating) {
        // Full star
        stars.push(
          <span key={i} style={{ color: '#ffd700', fontSize: '1.5rem' }}>★</span>
        );
      } else if (i - 0.5 <= numericRating) {
        // Half star (approximation)
        stars.push(
          <span key={i} style={{ color: '#ffd700', fontSize: '1.5rem', position: 'relative' }}>
            <span style={{ color: '#444' }}>★</span>
            <span style={{ 
              position: 'absolute', 
              left: 0, 
              width: '50%', 
              overflow: 'hidden',
              color: '#ffd700'
            }}>★</span>
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} style={{ color: '#444', fontSize: '1.5rem' }}>★</span>
        );
      }
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>{stars}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 101, 0, 0.3)',
          borderTop: '4px solid #ff6500',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
        <p style={{ color: '#ff6500', fontSize: '1.2rem' }}>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#ff8500', fontSize: '1.2rem', marginBottom: '20px' }}>
          ⚠️ {error || 'Movie not found'}
        </p>
        <Link
          to="/"
          style={{
            background: 'linear-gradient(45deg, #ff6500, #ff8500)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  const imageFilename = getImageFilename(movie.Name);
  const imagePath = getImagePath(imageFilename);
  const embedUrl = getYouTubeEmbedUrl(movie.Trailer);

  return (
    <div>
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/"
          style={{
            color: '#ff6500',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.color = '#ffffff'}
          onMouseOut={(e) => e.target.style.color = '#ff6500'}
        >
          ← Back to All Movies
        </Link>
      </div>

      {/* Movie Details */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(255, 101, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Movie Poster */}
          <div>
            <img
              src={imagePath}
              alt={`${movie.Name} poster`}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '2px solid rgba(255, 101, 0, 0.5)',
                boxShadow: '0 8px 32px rgba(255, 101, 0, 0.2)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Movie Information */}
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              background: 'linear-gradient(45deg, #ff6500, #ff8500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(255, 101, 0, 0.5)'
            }}>
              {movie.Name}
            </h1>

            {/* Release Date */}
            <div style={{
              fontSize: '1.2rem',
              color: '#ffffff',
              marginBottom: '24px',
              padding: '12px 16px',
              background: 'rgba(255, 101, 0, 0.1)',
              borderLeft: '4px solid #ff6500',
              borderRadius: '4px'
            }}>
              <strong>Release Date:</strong> {formatReleaseDate(movie.parsedReleaseDate)}
            </div>

            {/* Ratings Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                color: '#ff6500',
                fontSize: '1.5rem',
                marginBottom: '16px',
                textShadow: '0 0 10px rgba(255, 101, 0, 0.5)'
              }}>
                Ratings
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                  <div style={{
                    background: 'rgba(255, 101, 0, 0.1)',
                    border: '1px solid #ff6500',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#ff6500',
                      marginBottom: '8px'
                    }}>
                      {movie['Critic Rating']}
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                      Critics Score
                    </div>
                  </div>
                )}

                {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                  <div style={{
                    background: 'rgba(255, 133, 0, 0.1)',
                    border: '1px solid #ff8500',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#ff8500',
                      marginBottom: '8px'
                    }}>
                      {movie['Audience Rating']}
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                      Audience Score
                    </div>
                  </div>
                )}

                {movie['My Rating'] && movie['My Rating'] !== 'N/A' && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #ffffff',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {renderStarRating(movie['My Rating'])}
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                      Personal Rating
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Trailer Embed */}
        {embedUrl && (
          <div style={{
            marginTop: '40px',
            padding: '24px',
            background: 'rgba(255, 101, 0, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 101, 0, 0.2)'
          }}>
            <h3 style={{
              color: '#ff6500',
              fontSize: '1.5rem',
              marginBottom: '16px',
              textShadow: '0 0 10px rgba(255, 101, 0, 0.5)',
              textAlign: 'center'
            }}>
              🎬 Official Trailer
            </h3>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(255, 101, 0, 0.3)'
            }}>
              <iframe
                src={embedUrl}
                title={`${movie.Name} Trailer`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          background: 'rgba(255, 101, 0, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 101, 0, 0.2)'
        }}>
          <h3 style={{
            color: '#ff6500',
            fontSize: '1.5rem',
            marginBottom: '16px',
            textShadow: '0 0 10px rgba(255, 101, 0, 0.5)'
          }}>
            About This Movie
          </h3>
          <p style={{
            color: '#ffffff',
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            {movie.Name} is part of the MonsterVerse franchise, featuring the legendary King of the Monsters. 
            The film showcases spectacular kaiju battles, cutting-edge visual effects, and the ongoing saga 
            of these colossal titans that have captivated audiences worldwide.
          </p>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .movie-details-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          
          .movie-poster {
            max-width: 250px;
            margin: 0 auto;
          }
          
          .ratings-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MoviePage;
