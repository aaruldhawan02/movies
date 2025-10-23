import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadMovieData, formatReleaseDate, getImageFilename, getImagePath, getBeltColor } from './karate-kid-data';

const MoviePage = () => {
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
          <span key={i} style={{ color: '#FFD700', fontSize: '24px', marginRight: '4px' }}>★</span>
        );
      } else if (i - 0.5 <= numericRating) {
        // Half star
        stars.push(
          <span key={i} style={{ color: '#FFD700', fontSize: '24px', marginRight: '4px' }}>✭</span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} style={{ color: '#FFD700', fontSize: '24px', marginRight: '4px', opacity: 0.3 }}>☆</span>
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

  // Get some wisdom quotes based on the movie
  const getWisdomQuote = (movieName) => {
    if (movieName.includes('1984')) {
      return "Wax on, wax off. Don't forget to breathe, very important.";
    } else if (movieName.includes('Part II')) {
      return "For person with no forgiveness in heart, living even worse punishment than death.";
    } else if (movieName.includes('Part III')) {
      return "Trust the quality of what you know, not quantity.";
    } else if (movieName.includes('Cobra Kai')) {
      return "Sometimes the enemy living inside us is worse than the one we're fighting.";
    } else if (movieName.includes('2010')) {
      return "Being still and doing nothing are two completely different things.";
    } else {
      return "Balance is key. Balance good, karate good. Everything good.";
    }
  };

  // Get belt name from rating
  const getBeltName = (rating) => {
    if (!rating || rating === 'N/A') return 'Unranked';
    
    const numRating = parseFloat(rating);
    if (numRating >= 4.5) return 'Black Belt';
    if (numRating >= 4.0) return 'Brown Belt';
    if (numRating >= 3.5) return 'Blue Belt';
    if (numRating >= 3.0) return 'Green Belt';
    if (numRating >= 2.5) return 'Orange Belt';
    if (numRating >= 2.0) return 'Yellow Belt';
    return 'White Belt';
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid #8B2635',
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
        <p style={{ marginTop: '20px', opacity: 0.7, color: 'white' }}>Loading the way of the warrior...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: 'white' }}>Error</h1>
        <p style={{ marginBottom: '20px', color: '#8B2635' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="karate-button"
        >
          Return to Dojo
        </button>
      </div>
    );
  }

  if (!movie) return null;

  const imageFilename = getImageFilename(movie.Name);
  const imagePath = getImagePath(imageFilename);
  const beltColor = getBeltColor(movie['My Rating']);
  const beltName = getBeltName(movie['My Rating']);
  const isUpcoming = new Date(movie.parsedReleaseDate) > new Date();
  const youtubeVideoId = getYoutubeVideoId(movie.Trailer);
  
  // Determine if this is a movie or TV show
  const isShow = movie.Name.toLowerCase().includes('cobra kai') || movie.Name.toLowerCase().includes('season');
  const mediaType = isShow ? 'Series' : 'Movie';

  return (
    <div style={{ color: 'white' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 38, 53, 0.3)'
      }}>
        {/* Movie Poster */}
        <div style={{ position: 'relative' }}>
          <div style={{ 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            aspectRatio: '2/3',
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
              background: 'linear-gradient(135deg, #5D1A1A 0%, #8B2635 100%)',
              padding: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '24px',
            }}>
              {movie.Name}
            </div>
          </div>
          
          {/* Belt rank indicator */}
          <div className={`${beltColor}`} style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '12px',
            borderRadius: '6px',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}></div>

          {/* Release badge for upcoming movies */}
          {isUpcoming && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '-10px',
              backgroundColor: '#8B2635',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transform: 'rotate(-5deg)',
              textTransform: 'uppercase'
            }}>
              UPCOMING
            </div>
          )}
        </div>
        
        {/* Movie Details */}
        <div>
          {/* Media type and belt badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span style={{
              background: '#8B2635',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {mediaType}
            </span>
            {movie['My Rating'] && movie['My Rating'] !== 'N/A' && (
              <span className={beltColor} style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: movie['My Rating'] === 'N/A' ? '#666' : 
                       getBeltColor(movie['My Rating']) === 'belt-black' ? 'white' : 'black'
              }}>
                {beltName}
              </span>
            )}
          </div>

          <h1 style={{ 
            fontSize: '36px', 
            marginBottom: '16px',
            color: 'white',
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '16px',
            lineHeight: '1.2'
          }}>
            {movie.Name}
          </h1>
          
          <div style={{ marginBottom: '24px', fontSize: '18px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ opacity: 0.7 }}>Release Date: </span>
              <span style={{ fontWeight: '500' }}>{formatReleaseDate(movie.parsedReleaseDate)}</span>
            </div>
            
            {/* Sensei Wisdom Quote */}
            <div className="sensei-text" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderLeft: '4px solid #8B2635',
              padding: '16px',
              margin: '20px 0',
              borderRadius: '4px',
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              "{getWisdomQuote(movie.Name)}"
            </div>
            
            {/* Ratings */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>Critics Score</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#8B2635',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}>
                    {movie['Critic Rating']}
                  </div>
                </div>
              )}
              
              {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>Audience Score</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#A0404D',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}>
                    {movie['Audience Rating']}
                  </div>
                </div>
              )}
              
              {movie['My Rating'] && movie['My Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>My Rating</div>
                  {/* Star rating display only */}
                  {renderStarRating(movie['My Rating'])}
                </div>
              )}
            </div>
          </div>
          
          {/* Embedded YouTube video */}
          {youtubeVideoId && (
            <div style={{ 
              marginTop: '32px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
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
};

export default MoviePage;
