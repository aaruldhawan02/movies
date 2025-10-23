import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadMovieData, formatReleaseDate, getImageFilename, getImagePath } from './fast-data';

function MoviePage() {
  const { movieTitle } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMovie = async () => {
      setIsLoading(true);
      try {
        const movies = await loadMovieData();
        const foundMovie = movies.find(m => m.Name === decodeURIComponent(movieTitle));
        
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        console.error('Error loading movie:', err);
        setError('Failed to load movie data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovie();
  }, [movieTitle]);
  
  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };
  
  // Function to render star rating
  const renderStarRating = (rating) => {
    if (!rating || rating === 'N/A') return null;
    
    // Extract the numeric value from the rating (e.g., "4.5/5" -> 4.5)
    const numericRating = parseFloat(rating.split('/')[0]);
    const maxRating = parseInt(rating.split('/')[1]) || 5;
    
    const stars = [];
    
    // Create an array of stars
    for (let i = 1; i <= maxRating; i++) {
      if (i <= Math.floor(numericRating)) {
        // Full star
        stars.push(
          <span key={i} style={{ color: '#ff3838', fontSize: '24px', marginRight: '4px' }}>★</span>
        );
      } else if (i - 0.5 <= numericRating) {
        // Half star - using a different character for half star
        stars.push(
          <span key={i} style={{ color: '#ff3838', fontSize: '24px', marginRight: '4px' }}>✭</span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} style={{ color: '#ff3838', fontSize: '24px', marginRight: '4px', opacity: 0.3 }}>☆</span>
        );
      }
    }
    
    return (
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
        {stars}
      </div>
    );
  };
  
  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.1)',
            borderTop: '5px solid #ff3838',
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
        <p style={{ marginTop: '20px', opacity: 0.7, color: 'white' }}>Loading movie details...</p>
      </div>
    );
  }
  
if (error) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#2C3E50' }}>Error</h1>
      <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
      <button 
        onClick={() => navigate('/')}
        className="fast-button"
      >
        Go Back
      </button>
    </div>
  );
}

  if (!movie) return null;
  
  const imageFilename = getImageFilename(movie.Name);
  const imagePath = getImagePath(imageFilename);
  const isUpcoming = new Date(movie.parsedReleaseDate) > new Date();
  const youtubeVideoId = getYoutubeVideoId(movie.Trailer);
  
  return (
    <div style={{ 
      color: 'white',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '4px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 56, 56, 0.2)',
      }}>
        {/* Movie Poster */}
        <div style={{ position: 'relative' }}>
          <div style={{ 
            borderRadius: '4px', 
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            aspectRatio: '2/3',
            border: '1px solid rgba(255, 56, 56, 0.3)',
          }}>
            <img 
              src={imagePath}
              alt={movie.Name}
              onError={handleImageError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ff3838',
              padding: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '24px',
            }}>
              {movie.Name}
            </div>
          </div>
          
          {/* Release badge for upcoming movies */}
          {isUpcoming && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '-10px',
              backgroundColor: '#ff3838',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '2px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
              transform: 'rotate(5deg)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Coming Soon
            </div>
          )}
        </div>
        
        {/* Movie Details */}
        <div>
          <h1 style={{ 
            fontSize: '36px', 
            marginBottom: '16px',
            color: 'white',
            borderBottom: '2px solid rgba(255, 56, 56, 0.3)',
            paddingBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {movie.Name}
          </h1>
          
          <div style={{ marginBottom: '24px', fontSize: '18px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ opacity: 0.7 }}>Release Date: </span>
              <span style={{ fontWeight: '500' }}>{formatReleaseDate(movie.parsedReleaseDate)}</span>
            </div>
            
            {/* Ratings */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Critic Rating</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '2px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {movie['Critic Rating']}
                  </div>
                </div>
              )}
              
              {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Audience Rating</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#ff3838',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '2px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}>
                    {movie['Audience Rating']}
                  </div>
                </div>
              )}
              
              {movie['My Rating'] && movie['My Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Personal Rating</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#222',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '2px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: '1px solid #ff3838'
                  }}>
                    {movie['My Rating']}
                  </div>
                  {/* Star rating display */}
                  {renderStarRating(movie['My Rating'])}
                </div>
              )}
            </div>
          </div>
          
          {/* Embedded YouTube video */}
          {youtubeVideoId && (
            <div style={{ 
              marginTop: '24px',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
              border: '1px solid rgba(255, 56, 56, 0.3)',
            }}>
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={`${movie.Name} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MoviePage;
