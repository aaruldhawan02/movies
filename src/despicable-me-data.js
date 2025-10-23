import Papa from 'papaparse';

// Configuration for file paths
const config = {
  basePath: `${process.env.PUBLIC_URL || ''}/despicable-me`, // Base path for the project
  csvFileName: 'despicableMe.csv'
};

// Add caching to prevent multiple fetches
let cachedMovieData = null;

/**
 * Loads and parses the Despicable Me movies CSV file
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
        "Name": "Despicable Me",
        "Release Date": "7/9/2010",
        "Critic Rating": "80%",
        "Audience Rating": "83%",
        "My Rating": "4/5",
        "Trailer": "https://www.youtube.com/watch?v=zzCZ1W_CUoI",
        "parsedReleaseDate": new Date(2010, 6, 9)
      },
      {
        "Name": "Despicable Me 2",
        "Release Date": "7/3/2013",
        "Critic Rating": "75%",
        "Audience Rating": "85%",
        "My Rating": "4.5/5",
        "Trailer": "https://www.youtube.com/watch?v=yM9sKpQOuEw",
        "parsedReleaseDate": new Date(2013, 6, 3)
      },
      {
        "Name": "Minions",
        "Release Date": "7/10/2015",
        "Critic Rating": "55%",
        "Audience Rating": "49%",
        "My Rating": "3/5",
        "Trailer": "https://www.youtube.com/watch?v=eisKxhjBnZ0",
        "parsedReleaseDate": new Date(2015, 6, 10)
      },
      {
        "Name": "Despicable Me 3",
        "Release Date": "6/30/2017",
        "Critic Rating": "59%",
        "Audience Rating": "53%",
        "My Rating": "2.5/5",
        "Trailer": "https://www.youtube.com/watch?v=oagwBHoh6Rs",
        "parsedReleaseDate": new Date(2017, 5, 30)
      },
      {
        "Name": "Minions: The Rise of Gru",
        "Release Date": "7/1/2022",
        "Critic Rating": "69%",
        "Audience Rating": "89%",
        "My Rating": "4/5",
        "Trailer": "https://www.youtube.com/watch?v=6DxjJzmYsXo",
        "parsedReleaseDate": new Date(2022, 6, 1)
      },
      {
        "Name": "Despicable Me 4",
        "Release Date": "7/3/2024",
        "Critic Rating": "56%",
        "Audience Rating": "86%",
        "My Rating": "3.5/5",
        "Trailer": "https://www.youtube.com/watch?v=qQlr9-rF32A",
        "parsedReleaseDate": new Date(2024, 6, 3)
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
  return `${process.env.PUBLIC_URL || '.'}/posters/${filename}`;
};
