import Papa from 'papaparse';

// Function to load and parse CSV data
export const loadMovieData = async () => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/theboys/theBoys.csv`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    });
    
    if (result.errors.length > 0) {
      console.warn('CSV parsing errors:', result.errors);
    }
    
    // Process the data
    const processedData = result.data.map(row => {
      // Parse the release date
      let parsedDate;
      if (row['Release Date']) {
        // Handle different date formats
        if (row['Release Date'].includes('/')) {
          // Format: MM/DD/YYYY
          parsedDate = new Date(row['Release Date']);
        } else if (row['Release Date'].match(/^\d{4}$/)) {
          // Format: YYYY (just year)
          parsedDate = new Date(`${row['Release Date']}-01-01`);
        } else {
          // Try to parse as-is
          parsedDate = new Date(row['Release Date']);
        }
        
        // If parsing failed, set to null
        if (isNaN(parsedDate.getTime())) {
          parsedDate = null;
        }
      } else {
        parsedDate = null;
      }
      
      return {
        ...row,
        parsedReleaseDate: parsedDate
      };
    });
    
    return processedData;
  } catch (error) {
    console.error('Error loading movie data:', error);
    throw error;
  }
};

// Function to get movies by release status
export const getMoviesByReleaseStatus = async () => {
  const movies = await loadMovieData();
  const now = new Date();
  
  const upcoming = movies.filter(movie => 
    movie.parsedReleaseDate && movie.parsedReleaseDate > now
  );
  
  const released = movies.filter(movie => 
    !movie.parsedReleaseDate || movie.parsedReleaseDate <= now
  );
  
  // Sort upcoming by release date (earliest first)
  upcoming.sort((a, b) => a.parsedReleaseDate - b.parsedReleaseDate);
  
  // Sort released by release date (most recent first)
  released.sort((a, b) => {
    if (!a.parsedReleaseDate && !b.parsedReleaseDate) return 0;
    if (!a.parsedReleaseDate) return 1;
    if (!b.parsedReleaseDate) return -1;
    return b.parsedReleaseDate - a.parsedReleaseDate;
  });
  
  return { upcoming, released };
};

// Function to format release date for display
export const formatReleaseDate = (date) => {
  if (!date) return 'TBA';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
};

// Function to get image filename from movie name
export const getImageFilename = (movieName) => {
  if (!movieName) return 'default.jpg';
  
  // Create a mapping for specific titles to their image filenames
  const imageMap = {
    'The Boys Season 1': 'the-boys-season-1.jpg',
    'The Boys Season 2': 'the-boys-season-2.jpg',
    'The Boys Season 3': 'the-boys-season-3.jpg',
    'The Boys Season 4': 'the-boys-season-4.jpg',
    'The Boys Season 5': 'the-boys-season-5.jpg',
    'The Boys Presents: Diabolical': 'the-boys-diabolical.jpg',
    'Gen V Season 1': 'gen-v-season-1.jpg',
    'Gen V Season 2': 'gen-v-season-2.jpg'
  };
  
  // Check if we have a specific mapping
  if (imageMap[movieName]) {
    return imageMap[movieName];
  }
  
  // Fallback: create filename from movie name
  return movieName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    + '.jpg';
};

// Function to get full image path
export const getImagePath = (filename) => {
  return `${process.env.PUBLIC_URL}/posters/${filename}`;
};

// Function to get movie by name
export const getMovieByName = async (movieName) => {
  const movies = await loadMovieData();
  return movies.find(movie => movie.Name === movieName);
};

// Function to get YouTube video ID from URL
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

// Function to get YouTube thumbnail URL
export const getYouTubeThumbnail = (videoId, quality = 'maxresdefault') => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

// Function to search movies
export const searchMovies = async (searchTerm) => {
  const movies = await loadMovieData();
  
  if (!searchTerm) return movies;
  
  const term = searchTerm.toLowerCase();
  return movies.filter(movie => 
    movie.Name.toLowerCase().includes(term) ||
    (movie['Release Date'] && movie['Release Date'].toLowerCase().includes(term))
  );
};
