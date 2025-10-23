import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadMovieData, formatReleaseDate, getImagePath, getImageFilename } from './meninblack-data';

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
          setError('Mission file not found');
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to access classified data');
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
          <span key={i} style={{ color: '#ffffff', fontSize: '1.5rem' }}>★</span>
        );
      } else if (i - 0.5 <= numericRating) {
        // Half star (approximation)
        stars.push(
          <span key={i} style={{ color: '#ffffff', fontSize: '1.5rem', position: 'relative' }}>
            <span style={{ color: '#444' }}>★</span>
            <span style={{ 
              position: 'absolute', 
              left: 0, 
              width: '50%', 
              overflow: 'hidden',
              color: '#ffffff'
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
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
        <p style={{ color: '#ffffff', fontSize: '1.2rem', fontFamily: "'Courier New', monospace" }}>
          ACCESSING CLASSIFIED FILES...
        </p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid #ffffff',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '10px', fontFamily: "'Courier New', monospace" }}>
            ⚠️ ACCESS DENIED ⚠️
          </p>
          <p style={{ color: '#cccccc', fontSize: '1rem', fontFamily: "'Courier New', monospace" }}>
            {error || 'Mission file not found'}
          </p>
        </div>
        <Link
          to="/"
          className="meninblack-button"
          style={{
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          ← RETURN TO ARCHIVE
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
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s ease',
            fontFamily: "'Courier New', monospace",
            textTransform: 'uppercase'
          }}
          onMouseOver={(e) => e.target.style.color = '#cccccc'}
          onMouseOut={(e) => e.target.style.color = '#ffffff'}
        >
          ← BACK TO ARCHIVE
        </Link>
      </div>

      {/* Movie Details */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}>
        {/* Classification Header */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontFamily: "'Courier New', monospace",
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          TOP SECRET
        </div>

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
              alt={`${movie.Name} mission file`}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            
            {/* Agent Badge */}
            <div style={{
              marginTop: '16px',
              textAlign: 'center'
            }}>
              <div className="agent-badge" style={{ fontSize: '10px' }}>
                MISSION FILE #{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}
              </div>
            </div>
          </div>

          {/* Movie Information */}
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              background: 'linear-gradient(45deg, #ffffff, #c0c0c0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase'
            }}>
              {movie.Name}
            </h1>

            {/* Mission Code */}
            <div style={{
              fontSize: '1rem',
              color: '#ffffff',
              marginBottom: '16px',
              fontFamily: "'Courier New', monospace",
              letterSpacing: '2px'
            }}>
              MISSION CODE: {movie.Name.replace(/[^A-Z0-9]/g, '').substring(0, 8)}
            </div>

            {/* Release Date */}
            <div style={{
              fontSize: '1.2rem',
              color: '#ffffff',
              marginBottom: '24px',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderLeft: '4px solid #ffffff',
              borderRadius: '4px',
              fontFamily: "'Courier New', monospace"
            }}>
              <strong>MISSION DATE:</strong> {formatReleaseDate(movie.parsedReleaseDate)}
            </div>

            {/* Ratings Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                color: '#ffffff',
                fontSize: '1.5rem',
                marginBottom: '16px',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                fontFamily: "'Courier New', monospace",
                textTransform: 'uppercase'
              }}>
                MISSION ASSESSMENT
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #ffffff',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '8px',
                      fontFamily: "'Courier New', monospace"
                    }}>
                      {movie['Critic Rating']}
                    </div>
                    <div style={{ color: '#cccccc', fontSize: '0.9rem', fontFamily: "'Courier New', monospace" }}>
                      CRITIC ANALYSIS
                    </div>
                  </div>
                )}

                {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                  <div style={{
                    background: 'rgba(200, 200, 200, 0.1)',
                    border: '1px solid #c0c0c0',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#c0c0c0',
                      marginBottom: '8px',
                      fontFamily: "'Courier New', monospace"
                    }}>
                      {movie['Audience Rating']}
                    </div>
                    <div style={{ color: '#cccccc', fontSize: '0.9rem', fontFamily: "'Courier New', monospace" }}>
                      PUBLIC RESPONSE
                    </div>
                  </div>
                )}

                {movie['My Rating'] && movie['My Rating'] !== 'N/A' && (
                  <div style={{
                    background: 'rgba(100, 100, 100, 0.1)',
                    border: '1px solid #666666',
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
                    <div style={{ color: '#cccccc', fontSize: '0.9rem', fontFamily: "'Courier New', monospace" }}>
                      AGENT RATING
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
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.5rem',
              marginBottom: '16px',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
              textAlign: 'center',
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase'
            }}>
              📹 MISSION BRIEFING
            </h3>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)'
            }}>
              <iframe
                src={embedUrl}
                title={`${movie.Name} Mission Briefing`}
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
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '1.5rem',
            marginBottom: '16px',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            fontFamily: "'Courier New', monospace",
            textTransform: 'uppercase'
          }}>
            MISSION BRIEFING
          </h3>
          <p style={{
            color: '#ffffff',
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0,
            fontFamily: "'Courier New', monospace"
          }}>
            {movie.Name} documents the ongoing operations of the Men in Black organization, 
            tasked with monitoring and regulating alien activity on Earth. This classified 
            mission file contains evidence of extraterrestrial encounters, advanced alien 
            technology, and the dedicated agents who protect humanity from the scum of the universe.
          </p>
          
          {/* Warning Notice */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px'
          }}>
            <div style={{
              color: '#ffffff',
              fontSize: '0.9rem',
              fontFamily: "'Courier New', monospace",
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              ⚠️ WARNING: UNAUTHORIZED DISCLOSURE OF THIS INFORMATION IS PROHIBITED ⚠️
            </div>
            <div style={{
              color: '#cccccc',
              fontSize: '0.8rem',
              fontFamily: "'Courier New', monospace",
              textAlign: 'center',
              marginTop: '8px',
              opacity: 0.8
            }}>
              Violators will be subject to memory neutralization procedures
            </div>
          </div>
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
