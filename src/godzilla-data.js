import Papa from 'papaparse';

// Configuration for file paths
const config = {
  basePath: `${process.env.PUBLIC_URL || ''}/godzilla`, // Base path for the project
  csvFileName: 'godzilla.csv'
};

// Add caching to prevent multiple fetches
let cachedMovieData = null;

/**
 * Loads and parses the Godzilla movies CSV file
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
        "Name": "Godzilla",
        "Release Date": "5/16/2014",
        "Critic Rating": "76%",
        "Audience Rating": "66%",
        "My Rating": "3/5",
        "Trailer": "https://www.youtube.com/watch?v=vIu85WQTPRc",
        "parsedReleaseDate": new Date(2014, 4, 16)
      },
      {
        "Name": "Kong: Skull Island",
        "Release Date": "3/10/2017",
        "Critic Rating": "75%",
        "Audience Rating": "70%",
        "My Rating": "3.5/5",
        "Trailer": "https://www.youtube.com/watch?v=44LdLqgOpjo",
        "parsedReleaseDate": new Date(2017, 2, 10)
      },
      {
        "Name": "Godzilla: King of the Monsters",
        "Release Date": "5/31/2019",
        "Critic Rating": "42%",
        "Audience Rating": "83%",
        "My Rating": "3/5",
        "Trailer": "https://www.youtube.com/watch?v=QFxN2oDKk0E",
        "parsedReleaseDate": new Date(2019, 4, 31)
      },
      {
        "Name": "Godzilla vs Kong",
        "Release Date": "3/31/2021",
        "Critic Rating": "76%",
        "Audience Rating": "91%",
        "My Rating": "4.5/5",
        "Trailer": "https://www.youtube.com/watch?v=odM92ap8_c0",
        "parsedReleaseDate": new Date(2021, 2, 31)
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
  return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
};

// Get full image path with basePath
export const getImagePath = (filename) => {
  return `${config.basePath}/movieposters/${filename}`;
};
