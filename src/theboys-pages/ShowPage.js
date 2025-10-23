import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieByName, formatReleaseDate, getImageFilename, getImagePath, getYouTubeVideoId, getYouTubeThumbnail } from './theboys-data';

function ShowPage() {
  const { showTitle } = useParams();
  const [show, setShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadShow = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const decodedTitle = decodeURIComponent(showTitle);
        const showData = await getMovieByName(decodedTitle);
        
        if (!showData) {
          setError('Show not found');
        } else {
          setShow(showData);
        }
      } catch (error) {
        console.error('Error loading show data:', error);
        setError('Failed to load show data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShow();
  }, [showTitle]);

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
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
            borderTop: '5px solid #DC2626',
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
        <p style={{ marginTop: '20px', opacity: 0.7 }}>Loading show details...</p>
      </div>
    );
  }

  // Error state
  if (error || !show) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#DC2626' }}>
          {error || 'Show Not Found'}
        </h1>
        <p style={{ marginBottom: '30px', opacity: 0.7 }}>
          {error === 'Show not found' 
            ? "The show you're looking for doesn't exist in our database."
            : "There was an error loading the show details."
          }
        </p>
      </div>
    );
  }

  const imageFilename = getImageFilename(show.Name);
  const imagePath = getImagePath(imageFilename);
  const videoId = getYouTubeVideoId(show.Trailer);
  const thumbnailUrl = getYouTubeThumbnail(videoId);

  // Function to render star rating
  const renderStarRating = (rating, size = '20px') => {
    if (!rating || rating === 'N/A') return null;
    
    const numericRating = parseFloat(rating.split('/')[0]);
    const stars = [];
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} style={{ width: size, height: size, fill: '#DC2626', marginRight: '4px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half" style={{ width: size, height: size, marginRight: '4px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`halfStarGradient-detail`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#888888" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path fill={`url(#halfStarGradient-detail)`} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    
    // Add empty stars to make 5 total
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} style={{ width: size, height: size, fill: '#888888', opacity: 0.3, marginRight: '4px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {stars}
        <span style={{ marginLeft: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          {rating}
        </span>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Main content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '40px',
        marginBottom: '40px',
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
          gap: '20px'
        }
      }}>
        {/* Poster */}
        <div style={{ position: 'relative' }}>
          {!imageError ? (
            <img 
              src={imagePath}
              alt={show.Name}
              onError={handleImageError}
              style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                border: '2px solid rgba(220, 38, 38, 0.3)'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              aspectRatio: '2/3',
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '20px',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '2px solid rgba(220, 38, 38, 0.3)'
            }}>
              {show.Name}
            </div>
          )}
          
          {/* Release badge for upcoming shows */}
          {show.parsedReleaseDate && new Date(show.parsedReleaseDate) > new Date() && (
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              backgroundColor: '#DC2626',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>
              UPCOMING
            </div>
          )}
        </div>

        {/* Show details */}
        <div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: '#DC2626',
            lineHeight: '1.2'
          }}>
            {show.Name}
          </h1>
          
          <div style={{ 
            fontSize: '18px', 
            color: '#aaa', 
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            {formatReleaseDate(show.parsedReleaseDate)}
          </div>

          {/* Ratings */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              marginBottom: '20px', 
              color: 'white',
              borderBottom: '2px solid rgba(220, 38, 38, 0.3)',
              paddingBottom: '8px'
            }}>
              Ratings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Personal Rating */}
              {show['My Rating'] && show['My Rating'] !== 'N/A' && (
                <div>
                  <div style={{ fontSize: '16px', marginBottom: '8px', color: '#DC2626', fontWeight: 'bold' }}>
                    My Rating
                  </div>
                  {renderStarRating(show['My Rating'])}
                </div>
              )}
              
              {/* Critic Rating */}
              {show['Critic Rating'] && show['Critic Rating'] !== 'N/A' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: 'white', minWidth: '120px' }}>
                    Critics Score:
                  </span>
                  <span style={{ 
                    backgroundColor: '#DC2626',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {show['Critic Rating']}
                  </span>
                </div>
              )}
              
              {/* Audience Rating */}
              {show['Audience Rating'] && show['Audience Rating'] !== 'N/A' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: 'white', minWidth: '120px' }}>
                    Audience Score:
                  </span>
                  <span style={{ 
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {show['Audience Rating']}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Section */}
      {show.Trailer && videoId && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ 
            fontSize: '24px', 
            marginBottom: '20px', 
            color: 'white',
            borderBottom: '2px solid rgba(220, 38, 38, 0.3)',
            paddingBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Trailer
          </h3>
          
          <div style={{ 
            position: 'relative', 
            paddingBottom: '56.25%', 
            height: 0,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '2px solid rgba(220, 38, 38, 0.3)'
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${show.Name} Trailer`}
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

      {/* Additional Info */}
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(220, 38, 38, 0.2)'
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          marginBottom: '16px', 
          color: '#DC2626'
        }}>
          Show Information
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <strong style={{ color: 'white' }}>Release Date:</strong>
            <div style={{ color: '#aaa', marginTop: '4px' }}>
              {formatReleaseDate(show.parsedReleaseDate)}
            </div>
          </div>
          
          {show['Critic Rating'] && show['Critic Rating'] !== 'N/A' && (
            <div>
              <strong style={{ color: 'white' }}>Critics Score:</strong>
              <div style={{ color: '#aaa', marginTop: '4px' }}>
                {show['Critic Rating']}
              </div>
            </div>
          )}
          
          {show['Audience Rating'] && show['Audience Rating'] !== 'N/A' && (
            <div>
              <strong style={{ color: 'white' }}>Audience Score:</strong>
              <div style={{ color: '#aaa', marginTop: '4px' }}>
                {show['Audience Rating']}
              </div>
            </div>
          )}
          
          {show['My Rating'] && show['My Rating'] !== 'N/A' && (
            <div>
              <strong style={{ color: 'white' }}>Personal Rating:</strong>
              <div style={{ color: '#aaa', marginTop: '4px' }}>
                {show['My Rating']}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowPage;
