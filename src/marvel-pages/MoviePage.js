import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { loadMoviePrequels, getViewingOrder, loadMovieInfo } from './marvel-data';

function MoviePage() {
  const { movieTitle } = useParams();
  const location = useLocation();
  const movieTitleFromState = location.state?.movieTitle;
  const [movie, setMovie] = useState(null);
  const [directPrequels, setDirectPrequels] = useState([]);
  const [viewingOrder, setViewingOrder] = useState([]);
  const [movieInfo, setMovieInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posterError, setPosterError] = useState(false);
  const [reviewText, setReviewText] = useState(null);
  const [charactersInMovie, setCharactersInMovie] = useState([]);

  // Get color for tier
  const getTierColor = (tier) => {
    const tierColors = {
      'SS': '#FF44A4',
      'S': '#FF7F7F',
      'AA': '#FFBF7F',
      'A': '#FFDF7F',
      'AB': '#FFFF7F',
      'B': '#BFFF7F',
      'C': '#7FFF7F',
      'D': '#7FFFFF',
      'F': '#7F7FFF'
    };
    
    return tierColors[tier] || '#DDDDDD';
  };

  // Get format color
  const getFormatColor = (format) => {
    const formatColors = {
      'Movie': '#FF6B35', // Orange-red
      'TV Show': '#4ECDC4', // Teal
      'Animated Show': '#45B7D1', // Light blue
      'Shorts': '#96CEB4', // Light green
      'Unknown': '#6D6D6D' // Gray
    };
    
    return formatColors[format] || formatColors['Unknown'];
  };

  useEffect(() => {
    const loadMovieDetails = async () => {
      setIsLoading(true);
      setPosterError(false);
      setReviewText(null); // Reset review text to avoid showing old reviews
      
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
        
        const movieToPrequels = await loadMoviePrequels();
        console.log('Available movies count:', Object.keys(movieToPrequels).length);
        
        // Load movie info first to make sure it's available
        const movieInfoMap = await loadMovieInfo();
        console.log('Movie info map loaded:', Object.keys(movieInfoMap).length, 'movies');
        
        // Check if this movie exists in our data
        if (movieToPrequels.hasOwnProperty(decodedTitle)) {
          console.log('Found exact match for movie:', decodedTitle);
          setMovie(decodedTitle);
          
          // Set direct prequels
          const prequels = movieToPrequels[decodedTitle] || [];
          console.log('Direct prequels found:', prequels);
          setDirectPrequels(prequels);
          
          // Calculate viewing order based on release dates
          const order = await getViewingOrder(decodedTitle, movieToPrequels);
          console.log('Calculated viewing order by release date:', order);
          setViewingOrder(order);
          
          // Set movie info
          if (movieInfoMap && movieInfoMap[decodedTitle]) {
            console.log('Movie info found:', movieInfoMap[decodedTitle]);
            setMovieInfo(movieInfoMap[decodedTitle]);
          } else {
            console.log('No movie info found for:', decodedTitle);
          }
          
          // Load review if available
          try {
            const reviewFilename = getImageFilename(decodedTitle).replace('.png', '.txt');
            const reviewUrl = `/marvel-movies/moviereviews/${reviewFilename}`;
            const response = await fetch(reviewUrl);
            
            if (response.ok) {
              // Check if the response is an HTML document (which would indicate an error)
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('text/html')) {
                console.log('Received HTML instead of a plain text review for:', decodedTitle);
                setReviewText(null);
              } else {
                const reviewText = await response.text();
                // Check if the review starts with <!DOCTYPE html> (another way to detect HTML)
                if (reviewText.trim().toLowerCase().startsWith('<!doctype html')) {
                  console.log('Received HTML content instead of a plain text review');
                  setReviewText(null);
                } else {
                  setReviewText(reviewText);
                  console.log('Review loaded successfully for:', decodedTitle);
                }
              }
            } else {
              console.log('Review not found for:', decodedTitle);
              setReviewText(null);
            }
          } catch (reviewErr) {
            console.error('Error loading review:', reviewErr);
            setReviewText(null);
          }
          
          // Load characters that appear in this movie
          try {
            const characterResponse = await fetch('${process.env.PUBLIC_URL}/marvel-movies/characterMap.csv');
            if (characterResponse.ok) {
              const characterCsvText = await characterResponse.text();
              const characterLines = characterCsvText.trim().split('\n');
              
              if (characterLines.length >= 2) {
                const headers = characterLines[0].split(',');
                const projects = headers.slice(1);
                
                // Find the index of this movie in the headers
                const movieIndex = projects.findIndex(project => project === decodedTitle);
                
                if (movieIndex !== -1) {
                  const charactersInThisMovie = [];
                  
                  // Check each character row
                  for (let i = 1; i < characterLines.length; i++) {
                    const values = characterLines[i].split(',');
                    const characterName = values[0];
                    const appearances = values.slice(1);
                    
                    // If this character appears in this movie (value is '1')
                    if (appearances[movieIndex] === '1') {
                      // Count total appearances for tier calculation
                      const totalAppearances = appearances.filter(val => val === '1').length;
                      charactersInThisMovie.push({
                        name: characterName,
                        totalAppearances: totalAppearances
                      });
                    }
                  }
                  
                  // Sort characters by total appearances (most prominent first)
                  charactersInThisMovie.sort((a, b) => b.totalAppearances - a.totalAppearances);
                  console.log('Characters in this movie:', charactersInThisMovie);
                  setCharactersInMovie(charactersInThisMovie);
                }
              }
            }
          } catch (characterErr) {
            console.error('Error loading character data:', characterErr);
            setCharactersInMovie([]);
          }
        } else {
          console.log('Movie not found in exact match, trying case-insensitive match');
          // If not found, check if it might be case-insensitive match
          const matchedTitle = Object.keys(movieToPrequels).find(
            title => title.toLowerCase() === decodedTitle.toLowerCase()
          );
          
          if (matchedTitle) {
            console.log('Found case-insensitive match:', matchedTitle);
            setMovie(matchedTitle);
            
            const prequels = movieToPrequels[matchedTitle] || [];
            console.log('Direct prequels for matched title:', prequels);
            setDirectPrequels(prequels);
            
            const order = await getViewingOrder(matchedTitle, movieToPrequels);
            console.log('Viewing order for matched title by release date:', order);
            setViewingOrder(order);
            
            // Set movie info for the matched title
            if (movieInfoMap && movieInfoMap[matchedTitle]) {
              console.log('Movie info found for matched title:', movieInfoMap[matchedTitle]);
              setMovieInfo(movieInfoMap[matchedTitle]);
            } else {
              console.log('No movie info found for matched title:', matchedTitle);
              
              // Try to find movie info by similar name
              const similarTitle = Object.keys(movieInfoMap).find(
                title => title.toLowerCase().includes(matchedTitle.toLowerCase()) || 
                         matchedTitle.toLowerCase().includes(title.toLowerCase())
              );
              
              if (similarTitle) {
                console.log('Found movie info by similar title:', similarTitle);
                setMovieInfo(movieInfoMap[similarTitle]);
              }
            }
            
            // Load review if available
            try {
              const reviewFilename = getImageFilename(matchedTitle).replace('.png', '.txt');
              const reviewUrl = `/marvel-movies/moviereviews/${reviewFilename}`;
              const response = await fetch(reviewUrl);
              
              if (response.ok) {
                // Check if the response is an HTML document (which would indicate an error)
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                  console.log('Received HTML instead of a plain text review for:', matchedTitle);
                  setReviewText(null);
                } else {
                  const reviewText = await response.text();
                  // Check if the review starts with <!DOCTYPE html> (another way to detect HTML)
                  if (reviewText.trim().toLowerCase().startsWith('<!doctype html')) {
                    console.log('Received HTML content instead of a plain text review');
                    setReviewText(null);
                  } else {
                    setReviewText(reviewText);
                    console.log('Review loaded successfully for:', matchedTitle);
                  }
                }
              } else {
                console.log('Review not found for:', matchedTitle);
                setReviewText(null);
              }
            } catch (reviewErr) {
              console.error('Error loading review:', reviewErr);
              setReviewText(null);
            }
            
            // Load characters that appear in this movie
            try {
              const characterResponse = await fetch('${process.env.PUBLIC_URL}/marvel-movies/characterMap.csv');
              if (characterResponse.ok) {
                const characterCsvText = await characterResponse.text();
                const characterLines = characterCsvText.trim().split('\n');
                
                if (characterLines.length >= 2) {
                  const headers = characterLines[0].split(',');
                  const projects = headers.slice(1);
                  
                  // Find the index of this movie in the headers
                  const movieIndex = projects.findIndex(project => project === matchedTitle);
                  
                  if (movieIndex !== -1) {
                    const charactersInThisMovie = [];
                    
                    // Check each character row
                    for (let i = 1; i < characterLines.length; i++) {
                      const values = characterLines[i].split(',');
                      const characterName = values[0];
                      const appearances = values.slice(1);
                      
                      // If this character appears in this movie (value is '1')
                      if (appearances[movieIndex] === '1') {
                        // Count total appearances for tier calculation
                        const totalAppearances = appearances.filter(val => val === '1').length;
                        charactersInThisMovie.push({
                          name: characterName,
                          totalAppearances: totalAppearances
                        });
                      }
                    }
                    
                    // Sort characters by total appearances (most prominent first)
                    charactersInThisMovie.sort((a, b) => b.totalAppearances - a.totalAppearances);
                    console.log('Characters in this movie:', charactersInThisMovie);
                    setCharactersInMovie(charactersInThisMovie);
                  }
                }
              }
            } catch (characterErr) {
              console.error('Error loading character data:', characterErr);
              setCharactersInMovie([]);
            }
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

  // Convert movie title to image filename
  const getImageFilename = (title) => {
    // Replace spaces with underscores and remove special characters like : and ,
    return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
  };

  // Handle image load error
  const handlePosterError = () => {
    setPosterError(true);
  };

  // Format the date for better display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Check if it's just a partial date (MM/DD)
    if (dateStr.split('/').length === 2) {
      return dateStr; // Return as is
    }
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch (e) {
      console.warn('Error formatting date:', e);
    }
    
    return dateStr; // Return original if parsing fails
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div className="marvel-title" style={{ fontSize: '24px', marginBottom: '20px' }}>Marvel Movie Details</div>
        <div className="marvel-loader-container">
          <div className="marvel-loader"></div>
          <p style={{ marginTop: '20px', opacity: 0.7, color: 'white' }}>
            Loading details for {movieTitle ? decodeURIComponent(movieTitle) : 'movie'}...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 className="marvel-title" style={{ fontSize: '28px', marginBottom: '20px' }}>Error Loading Movie</h1>
        <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Movie Hero Section */}
      <div style={{
        margin: '-24px -20px 30px -20px',
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(/marvel-movies/assets/marvel-pattern-bg.jpg)',
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
                <div className="poster-container comic-panel">
                  <img 
                    src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movie)}`}
                    alt={`${movie} poster`}
                    onError={handlePosterError}
                    style={{
                      width: '100%',
                      display: 'block'
                    }}
                  />
                </div>
              ) : (
                <div className="poster-container comic-panel" style={{
                  width: '100%',
                  aspectRatio: '2/3',
                  backgroundColor: '#1a1a1a',
                  color: 'var(--marvel-red)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '20px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  <div style={{ 
                    fontSize: '40px',
                    marginBottom: '15px'
                  }}>
                    🎬
                  </div>
                  <div>{movie}</div>
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
                {movie}
              </h1>
              
              {/* Movie info */}
              {movieInfo && (
                <div style={{ 
                  marginBottom: '30px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px',
                    marginBottom: '25px'
                  }}>
                    {movieInfo.phase && (
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
                        <span style={{ opacity: 0.7 }}>Phase:</span>
                        <span style={{ fontWeight: 'bold' }}>{movieInfo.phase}</span>
                      </div>
                    )}
                    
                    {movieInfo.format && (
                      <div style={{
                        backgroundColor: getFormatColor(movieInfo.format),
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
                        <span>{movieInfo.format}</span>
                      </div>
                    )}
                    
                    {movieInfo.releaseDate && (
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
                        <span style={{ fontWeight: 'bold' }}>{formatDate(movieInfo.releaseDate)}</span>
                      </div>
                    )}
                    
                    {movieInfo.myTier && (
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
                        <span style={{ opacity: 0.7 }}>Tier:</span>
                        <span style={{
                          backgroundColor: getTierColor(movieInfo.myTier),
                          color: '#000',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>
                          {movieInfo.myTier}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '25px', 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {movieInfo.criticRating && (
                      <div style={{
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.7 }}>Critic Rating</div>
                        <div style={{
                          backgroundColor: '#d32f2f',
                          color: 'white',
                          borderRadius: '50%',
                          width: '70px',
                          height: '70px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontWeight: 'bold',
                          fontSize: '22px',
                          boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)'
                        }}>
                          {movieInfo.criticRating}
                        </div>
                      </div>
                    )}
                    
                    {movieInfo.audienceRating && (
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
                          {movieInfo.audienceRating}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Movie Trailer Section */}
                  {movieInfo.trailer && (
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
                          src={movieInfo.trailer.replace('watch?v=', 'embed/')}
                          title={`${movie} Official Trailer`}
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
                  
                  {/* Movie Review Section */}
                  {reviewText && (
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
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Tier List Justification
                      </h3>
                      <div style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        fontSize: '15px',
                        opacity: '0.9',
                        fontStyle: 'italic',
                        textAlign: 'justify'
                      }}>
                        {reviewText}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Characters Section */}
      {charactersInMovie.length > 0 && (
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto 50px'
        }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '25px',
            position: 'relative',
            paddingBottom: '10px',
            color: 'white'
          }}>
            <span style={{
              display: 'inline-block',
              position: 'relative',
              zIndex: 1
            }}>
              Characters ({charactersInMovie.length})
            </span>
            <span style={{
              position: 'absolute',
              height: '3px',
              width: '60px',
              backgroundColor: '#d32f2f',
              bottom: 0,
              left: 0
            }}></span>
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '20px'
          }}>
            {charactersInMovie.map((character, index) => {
              const getCharacterImageFilename = (characterName) => {
                return characterName.replace(/ /g, '_').replace(/[():.?!,]/g, '') + '.png';
              };
              
              return (
                <Link 
                  key={index}
                  to={`../character/${encodeURIComponent(character.name)}`}
                  state={{ characterName: character.name }}
                  style={{ 
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div className="character-card">
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '2/3',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={`${process.env.PUBLIC_URL}/marvel-movies/characterpictures/${getCharacterImageFilename(character.name)}`}
                        alt={`${character.name}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        className="character-card-image"
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#1a1a1a',
                          color: 'var(--marvel-red)',
                          display: 'none',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '10px',
                          textAlign: 'center',
                          fontSize: '14px'
                        }}
                      >
                        <div style={{ 
                          fontSize: '24px',
                          marginBottom: '8px'
                        }}>
                          👤
                        </div>
                        {character.name}
                      </div>
                      
                      {/* Appearance count badge */}
                      <div className="marvel-phase-badge" style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                      }}>
                        {character.totalAppearances}
                      </div>
                      
                      <div className="character-card-content">
                        <h3 className="character-card-name">{character.name}</h3>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Direct Prequels Section */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto 50px'
      }}>
        <h2 className="marvel-section-header">
          Direct Prequels
        </h2>
        
        {directPrequels.length > 0 ? (
          <div className="movie-grid">
            {directPrequels.map(prequel => {
              const posterFilename = getImageFilename(prequel);
              return (
                <Link 
                  key={prequel}
                  to={`../movie/${encodeURIComponent(prequel)}`}
                  state={{ movieTitle: prequel }}
                  style={{ 
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div className="movie-card">
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={`${process.env.PUBLIC_URL}/posters/${posterFilename}`}
                        alt={`${prequel} poster`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        className="movie-card-image"
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#1a1a1a',
                          color: 'var(--marvel-red)',
                          display: 'none',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '10px',
                          textAlign: 'center',
                          fontSize: '14px'
                        }}
                      >
                        <div style={{ 
                          fontSize: '28px',
                          marginBottom: '10px'
                        }}>
                          🎬
                        </div>
                        {prequel}
                      </div>
                    </div>
                    <div className="movie-card-content">
                      <h3 className="movie-card-title">{prequel}</h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            This movie has no direct prequels in the Marvel Universe.
          </div>
        )}
      </div>
      
      {/* Recommended Viewing Order Section */}
      {viewingOrder.length > 1 && (
        <div style={{
          maxWidth: '1100px',
          margin: '50px auto 30px'
        }}>
          <h2 className="marvel-section-header">
            Recommended Viewing Order
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <div className="viewing-order-scroll" style={{ 
              display: 'flex',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              gap: '15px',
              paddingBottom: '10px'
            }}>
              {viewingOrder.map((movieInOrder, index) => (
                <Link 
                  key={index}
                  to={`../movie/${encodeURIComponent(movieInOrder)}`}
                  state={{ movieTitle: movieInOrder }}
                  style={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    minWidth: '140px',
                    maxWidth: '140px'
                  }}
                >
                  <div className={movieInOrder === movie ? "movie-card" : "movie-card"} style={{
                    boxShadow: movieInOrder === movie ? 
                      '0 0 0 3px var(--marvel-red), 0 4px 10px rgba(0, 0, 0, 0.3)' : 
                      '0 4px 8px rgba(0, 0, 0, 0.2)',
                    backgroundColor: movieInOrder === movie ? 'rgba(237, 29, 36, 0.1)' : 'transparent'
                  }}>
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img 
                        src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movieInOrder)}`}
                        alt={`${movieInOrder} poster`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        className="movie-card-image"
                        style={{
                          opacity: movieInOrder === movie ? '1' : '0.85'
                        }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#1a1a1a',
                          color: 'var(--marvel-red)',
                          display: 'none',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '10px',
                          textAlign: 'center',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ 
                          fontSize: '24px',
                          marginBottom: '8px'
                        }}>
                          🎬
                        </div>
                        {movieInOrder}
                      </div>
                      
                      {/* Order number badge */}
                      <div className="marvel-phase-badge" style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: movieInOrder === movie ? 'var(--marvel-red)' : 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '0'
                      }}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="movie-card-content" style={{
                      backgroundColor: movieInOrder === movie ? 'var(--marvel-red)' : 'rgba(0,0,0,0.7)',
                      fontWeight: movieInOrder === movie ? 'bold' : 'normal'
                    }}>
                      {movieInOrder === movie ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '10px' }}>➤</span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {movieInOrder}
                          </span>
                        </div>
                      ) : (
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {movieInOrder}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoviePage;