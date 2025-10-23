import Papa from 'papaparse';

// Configuration for file paths
const config = {
  basePath: `${process.env.PUBLIC_URL || ''}/rocky`, // Base path for the project
  csvFileName: 'rocky.csv'
};

// Add caching to prevent multiple fetches
let cachedMovieData = null;

/**
 * Loads and parses the Rocky CSV file
 * @returns {Promise<Array>} A promise that resolves to an array of movie objects
 */
export const loadMovieData = async () => {
  // Return cached data if available
  if (cachedMovieData) {
    console.log('Using cached movie data');
    return cachedMovieData;
  }
  
  try {
    // Construct the full path to the CSV file
    const csvPath = `${config.basePath}/${config.csvFileName}`;
    console.log(`Fetching CSV from: ${csvPath}`);
    
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // Parse the CSV
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: ({ data, errors }) => {
          if (errors.length > 0) {
            console.error('CSV parsing errors:', errors);
            reject(new Error('Failed to parse CSV data'));
            return;
          }
          
          // Process the data to include parsed dates
          const processedData = data.map(movie => {
            return {
              ...movie,
              parsedReleaseDate: parseReleaseDate(movie['Release Date'])
            };
          });
          
          // Cache the result
          cachedMovieData = processedData;
          resolve(processedData);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading movie data:', error);
    
    // Fallback data in case the CSV can't be loaded
    const fallbackData = [
      {
        "Name": "Rocky",
        "Release Date": "12/3/1976",
        "Critic Rating": "93%",
        "Audience Rating": "69%",
        "My Rating": "3.5/5",
        "Trailer": "https://www.youtube.com/watch?v=-Hk-LYcavrw",
        "parsedReleaseDate": new Date(1976, 11, 3)
      },
      {
        "Name": "Creed",
        "Release Date": "11/25/2015",
        "Critic Rating": "95%",
        "Audience Rating": "89%",
        "My Rating": "4.5/5",
        "Trailer": "https://www.youtube.com/watch?v=Uv554B7YHk4",
        "parsedReleaseDate": new Date(2015, 10, 25)
      },
      {
        "Name": "Creed III",
        "Release Date": "3/3/2023",
        "Critic Rating": "89%",
        "Audience Rating": "95%",
        "My Rating": "4.5/5",
        "Trailer": "https://www.youtube.com/watch?v=AHmCH7iB_IM",
        "parsedReleaseDate": new Date(2023, 2, 3)
      }
    ];
    
    console.log('Using fallback data');
    cachedMovieData = fallbackData;
    return fallbackData;
  }
};

// Parse release date from string
const parseReleaseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  
  // Try to parse the date in MM/DD/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    
    // Handle 2-digit years
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Default date parsing
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  console.warn(`Could not parse date: ${dateStr}, using epoch`);
  return new Date(0);
};

// Format date for display
export const formatReleaseDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Get upcoming and released movies
export const getMoviesByReleaseStatus = async () => {
  const movies = await loadMovieData();
  const currentDate = new Date();
  
  const upcoming = [];
  const released = [];
  
  movies.forEach(movie => {
    if (movie.parsedReleaseDate > currentDate) {
      upcoming.push(movie);
    } else {
      released.push(movie);
    }
  });
  
  // Sort upcoming movies by release date (earliest first)
  upcoming.sort((a, b) => a.parsedReleaseDate - b.parsedReleaseDate);
  
  // Sort released movies by release date (newest first)
  released.sort((a, b) => b.parsedReleaseDate - a.parsedReleaseDate);
  
  return { upcoming, released };
};

// Convert movie title to image filename
export const getImageFilename = (title) => {
  // Replace spaces with underscores and remove special characters like : and ,
  return title.replace(/ /g, '_').replace(/[:,.?!()]/g, '') + '.png';
};

// Get full image path with basePath
export const getImagePath = (filename) => {
  return `${config.basePath}/movieposters/${filename}`;
};

// Get championship belt color based on rating
export const getChampionshipBelt = (rating) => {
  if (!rating || rating === 'N/A') return 'belt-bronze';
  
  const numRating = parseFloat(rating);
  if (numRating >= 4.5) return 'belt-champion';
  if (numRating >= 4.0) return 'belt-gold';
  if (numRating >= 3.5) return 'belt-platinum';
  if (numRating >= 3.0) return 'belt-silver';
  return 'belt-bronze';
};

// Get championship title based on rating
export const getChampionshipTitle = (rating) => {
  if (!rating || rating === 'N/A') return 'Contender';
  
  const numRating = parseFloat(rating);
  if (numRating >= 4.5) return 'Heavyweight Champion';
  if (numRating >= 4.0) return 'Champion';
  if (numRating >= 3.5) return 'Title Holder';
  if (numRating >= 3.0) return 'Ranked Fighter';
  return 'Contender';
};
